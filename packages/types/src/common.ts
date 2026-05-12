import { z } from 'zod';

export const successSchema = z.object({
  success: z.literal(true),
});
export type SuccessResponse = z.infer<typeof successSchema>;

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const csrfResponseSchema = z.object({
  csrfToken: z.string().min(32),
});
export type CsrfResponse = z.infer<typeof csrfResponseSchema>;
