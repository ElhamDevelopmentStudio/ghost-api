import type { Attachment } from '@prisma/client';

type AttachmentUrlInput = Pick<Attachment, 'id' | 'thumbnailKey'>;

export function attachmentOriginalUrl(id: string): string {
  return `/uploads/${id}/file`;
}

export function attachmentThumbnailUrl(attachment: AttachmentUrlInput): string | null {
  if (!attachment.thumbnailKey) return null;
  return `/uploads/${attachment.id}/file?variant=thumbnail`;
}
