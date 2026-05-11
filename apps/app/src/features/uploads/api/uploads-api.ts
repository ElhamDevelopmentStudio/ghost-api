import { getCsrfToken } from '@/features/auth/api/auth-api';
import { apiRequest } from '@/lib/api-client';
import { env } from '@/lib/env';

const CSRF_HEADER = 'x-csrf-token';

export type UploadPurpose = 'project-avatar' | 'user-avatar' | 'workspace-attachment';

export type Attachment = {
  id: string;
  purpose: string;
  status: 'PENDING' | 'READY';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  objectKey: string;
  url: string;
  thumbnailUrl: string | null;
};

type CreateUploadResponse = {
  attachment: Attachment;
  upload: {
    method: 'PUT';
    url: string;
    headers: Record<string, string>;
    expiresInSeconds: number;
  };
};

type CompleteUploadResponse = {
  attachment: Attachment;
};

export async function uploadAttachment(input: {
  file: File;
  purpose: UploadPurpose;
}): Promise<Attachment> {
  const csrfToken = await getCsrfToken();
  const createResponse = await apiRequest<CreateUploadResponse>({
    path: '/uploads',
    method: 'POST',
    body: {
      purpose: input.purpose,
      fileName: input.file.name,
      mimeType: input.file.type || 'application/octet-stream',
      sizeBytes: input.file.size,
    },
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  const uploadResponse = await fetch(createResponse.upload.url, {
    method: createResponse.upload.method,
    headers: createResponse.upload.headers,
    body: input.file,
  });
  if (!uploadResponse.ok) {
    throw new Error('Upload failed before it reached GhostAPI');
  }

  const completeResponse = await apiRequest<CompleteUploadResponse>({
    path: `/uploads/${createResponse.attachment.id}/complete`,
    method: 'POST',
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  return completeResponse.attachment;
}

export function attachmentAssetUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${env.VITE_API_URL}${url}`;
}
