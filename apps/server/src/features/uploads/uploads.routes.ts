import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import sharp from 'sharp';
import {
  type Attachment,
  type AttachmentPurpose,
  type AttachmentStatus,
  createUploadBodySchema,
} from '@ghostapi/types';

import { prisma } from '../../db.js';
import { logger } from '../../logger.js';
import type { AppEnv } from '../../server/types.js';
import { authContext, requireAuth, requireCsrf } from '../auth/index.js';
import {
  attachmentPurposeByUploadPurpose,
  IMAGE_MIME_TYPES,
  uploadFolderByPurpose,
} from './upload.constants.js';
import { attachmentOriginalUrl, attachmentThumbnailUrl } from './upload.urls.js';
import { getObjectBuffer, headObject, putObject, signedGetUrl, signedPutUrl } from './r2.client.js';

export const uploadsRouter = new Hono<AppEnv>();

uploadsRouter.use('*', requireAuth);

uploadsRouter.post('/', requireCsrf, zValidator('json', createUploadBodySchema), async (c) => {
  const input = c.req.valid('json');
  const { userId } = authContext(c);
  const isImage = IMAGE_MIME_TYPES.has(input.mimeType);

  if (input.purpose.endsWith('avatar') && !isImage) {
    return c.json({ error: 'Avatar uploads must be images' }, 400);
  }

  const id = randomUUID();
  const extension = extensionFor(input.fileName, input.mimeType);
  const objectKey = `${uploadFolderByPurpose[input.purpose]}/${userId}/${id}/original${extension}`;
  const thumbnailKey = isImage
    ? `${uploadFolderByPurpose[input.purpose]}/${userId}/${id}/thumbnail.webp`
    : null;

  const attachment = await prisma.attachment.create({
    data: {
      id,
      ownerId: userId,
      purpose: attachmentPurposeByUploadPurpose[input.purpose],
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      objectKey,
      thumbnailKey,
    },
  });

  const uploadUrl = await signedPutUrl({
    key: objectKey,
    contentType: input.mimeType,
    contentLength: input.sizeBytes,
  });

  return c.json({
    attachment: serializeAttachment(attachment),
    upload: {
      method: 'PUT',
      url: uploadUrl,
      headers: {
        'content-type': input.mimeType,
      },
      expiresInSeconds: 300,
    },
  });
});

uploadsRouter.post('/:id/complete', requireCsrf, async (c) => {
  const { userId } = authContext(c);
  const attachment = await prisma.attachment.findFirst({
    where: { id: c.req.param('id'), ownerId: userId },
  });
  if (!attachment) return c.json({ error: 'Attachment not found' }, 404);

  try {
    await headObject(attachment.objectKey);

    if (attachment.thumbnailKey && IMAGE_MIME_TYPES.has(attachment.mimeType)) {
      const original = await getObjectBuffer(attachment.objectKey);
      const thumbnail = await sharp(original)
        .rotate()
        .resize(256, 256, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      await putObject({
        key: attachment.thumbnailKey,
        body: thumbnail,
        contentType: 'image/webp',
      });
    }

    const completed = await prisma.attachment.update({
      where: { id: attachment.id },
      data: { status: 'READY' },
    });

    return c.json({ attachment: serializeAttachment(completed) });
  } catch (error) {
    logger.error({ err: error, attachmentId: attachment.id }, 'Failed to finalize upload');
    return c.json({ error: 'Uploaded object could not be finalized' }, 422);
  }
});

uploadsRouter.get('/:id/file', async (c) => {
  const { userId } = authContext(c);
  const variant = c.req.query('variant') === 'thumbnail' ? 'thumbnail' : 'original';
  const attachment = await prisma.attachment.findFirst({
    where: { id: c.req.param('id'), ownerId: userId, status: 'READY' },
  });
  if (!attachment) return c.json({ error: 'Attachment not found' }, 404);

  const key = variant === 'thumbnail' ? attachment.thumbnailKey : attachment.objectKey;
  if (!key) return c.json({ error: 'Attachment variant not found' }, 404);

  return c.redirect(await signedGetUrl(key), 302);
});

function serializeAttachment(attachment: {
  id: string;
  fileName: string;
  mimeType: string;
  objectKey: string;
  purpose: AttachmentPurpose;
  sizeBytes: number;
  status: AttachmentStatus;
  thumbnailKey: string | null;
}): Attachment {
  return {
    id: attachment.id,
    purpose: attachment.purpose,
    status: attachment.status,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    objectKey: attachment.objectKey,
    url: attachmentOriginalUrl(attachment.id),
    thumbnailUrl: attachmentThumbnailUrl(attachment),
  };
}

function extensionFor(fileName: string, mimeType: string): string {
  const fromName = extname(fileName)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
  if (fromName) return fromName;

  const byMimeType: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
  };

  return byMimeType[mimeType] ?? '';
}
