import { z } from 'zod';

export const uploadPurposeSchema = z.enum([
  'project-avatar',
  'user-avatar',
  'workspace-attachment',
]);

export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;

export const attachmentPurposeByUploadPurpose = {
  'project-avatar': 'PROJECT_AVATAR',
  'user-avatar': 'USER_AVATAR',
  'workspace-attachment': 'WORKSPACE_ATTACHMENT',
} as const;

export const uploadPurposeByAttachmentPurpose = {
  PROJECT_AVATAR: 'project-avatar',
  USER_AVATAR: 'user-avatar',
  WORKSPACE_ATTACHMENT: 'workspace-attachment',
} as const;

export const uploadFolderByPurpose = {
  'project-avatar': 'projects/avatars',
  'user-avatar': 'users/avatars',
  'workspace-attachment': 'workspace/attachments',
} as const satisfies Record<UploadPurpose, string>;

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
