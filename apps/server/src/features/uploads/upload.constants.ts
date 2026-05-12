import type { UploadPurpose } from '@ghostapi/types';

export {
  attachmentPurposeByUploadPurpose,
  MAX_UPLOAD_BYTES,
  uploadPurposeByAttachmentPurpose,
  uploadPurposeSchema,
  type UploadPurpose,
} from '@ghostapi/types';

export const uploadFolderByPurpose = {
  'project-avatar': 'projects/avatars',
  'user-avatar': 'users/avatars',
  'workspace-attachment': 'workspace/attachments',
} as const satisfies Record<UploadPurpose, string>;

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
