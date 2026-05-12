import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const uploadPurposeSchema = z.enum([
  'project-avatar',
  'user-avatar',
  'workspace-attachment',
]);
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;

export const attachmentPurposeSchema = z.enum([
  'PROJECT_AVATAR',
  'USER_AVATAR',
  'WORKSPACE_ATTACHMENT',
]);
export type AttachmentPurpose = z.infer<typeof attachmentPurposeSchema>;

export const attachmentStatusSchema = z.enum(['PENDING', 'READY']);
export type AttachmentStatus = z.infer<typeof attachmentStatusSchema>;

export const attachmentPurposeByUploadPurpose = {
  'project-avatar': 'PROJECT_AVATAR',
  'user-avatar': 'USER_AVATAR',
  'workspace-attachment': 'WORKSPACE_ATTACHMENT',
} as const satisfies Record<UploadPurpose, AttachmentPurpose>;

export const uploadPurposeByAttachmentPurpose = {
  PROJECT_AVATAR: 'project-avatar',
  USER_AVATAR: 'user-avatar',
  WORKSPACE_ATTACHMENT: 'workspace-attachment',
} as const satisfies Record<AttachmentPurpose, UploadPurpose>;

export const createUploadBodySchema = z.object({
  purpose: uploadPurposeSchema,
  fileName: z.string().min(1).max(180),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type CreateUploadInput = z.infer<typeof createUploadBodySchema>;

export const attachmentSchema = z.object({
  id: z.string().uuid(),
  purpose: attachmentPurposeSchema,
  status: attachmentStatusSchema,
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  objectKey: z.string(),
  url: z.string(),
  thumbnailUrl: z.string().nullable(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

export const signedUploadSchema = z.object({
  method: z.literal('PUT'),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()),
  expiresInSeconds: z.number().int().positive(),
});
export type SignedUpload = z.infer<typeof signedUploadSchema>;

export const createUploadResponseSchema = z.object({
  attachment: attachmentSchema,
  upload: signedUploadSchema,
});
export type CreateUploadResponse = z.infer<typeof createUploadResponseSchema>;

export const completeUploadResponseSchema = z.object({
  attachment: attachmentSchema,
});
export type CompleteUploadResponse = z.infer<typeof completeUploadResponseSchema>;
