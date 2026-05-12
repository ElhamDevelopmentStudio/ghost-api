import { Resend } from 'resend';

import { env } from '../../env.js';
import { logger } from '../../logger.js';

let resendClient: Resend | null = null;

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}

export function ensureEmailDeliveryConfigured(): void {
  const e = env();

  if (!e.MAIL_PASSWORD) {
    throw new EmailDeliveryError('Email delivery is not configured.');
  }
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string | null;
  verificationUrl: string;
}): Promise<void> {
  const e = env();

  if (!e.MAIL_PASSWORD) {
    throw new EmailDeliveryError('Email delivery is not configured.');
  }

  resendClient ??= new Resend(e.MAIL_PASSWORD);

  const { data, error } = await resendClient.emails.send({
    from: `GhostAPI <${e.MAIL_FROM}>`,
    to: input.to,
    subject: 'Verify your GhostAPI email',
    html: verificationEmailHtml(input),
    text: verificationEmailText(input),
  });

  if (error) {
    logger.error({ error, to: input.to }, 'Failed to send email verification');
    throw new EmailDeliveryError(emailErrorMessage(error, 'Unable to send verification email.'));
  }

  logger.info({ emailId: data?.id, to: input.to }, 'Sent email verification');
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string | null;
  resetUrl: string;
}): Promise<void> {
  const e = env();

  if (!e.MAIL_PASSWORD) {
    throw new EmailDeliveryError('Email delivery is not configured.');
  }

  resendClient ??= new Resend(e.MAIL_PASSWORD);

  const { data, error } = await resendClient.emails.send({
    from: `GhostAPI <${e.MAIL_FROM}>`,
    to: input.to,
    subject: 'Reset your GhostAPI password',
    html: passwordResetEmailHtml(input),
    text: passwordResetEmailText(input),
  });

  if (error) {
    logger.error({ error, to: input.to }, 'Failed to send password reset');
    throw new EmailDeliveryError(emailErrorMessage(error, 'Unable to send password reset email.'));
  }

  logger.info({ emailId: data?.id, to: input.to }, 'Sent password reset email');
}

function emailErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

function verificationEmailText(input: { name: string | null; verificationUrl: string }): string {
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  return `${greeting}

Verify your GhostAPI email address by opening this link:
${input.verificationUrl}

This link expires in 24 hours.`;
}

function verificationEmailHtml(input: { name: string | null; verificationUrl: string }): string {
  const greeting = input.name ? `Hi ${escapeHtml(input.name)},` : 'Hi,';
  const url = escapeHtml(input.verificationUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#030408;color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="color:#a78bfa;font-family:monospace;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">GhostAPI</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">Verify your email address</h1>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 24px;">${greeting}</p>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 28px;">Confirm this email address to finish creating your GhostAPI account.</p>
      <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;padding:14px 18px;font-weight:600;">Verify email</a>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:28px 0 0;">This link expires in 24 hours. If the button does not work, paste this URL into your browser:</p>
      <p style="word-break:break-all;color:#c4b5fd;font-size:13px;line-height:1.6;">${url}</p>
    </div>
  </body>
</html>`;
}

function passwordResetEmailText(input: { name: string | null; resetUrl: string }): string {
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  return `${greeting}

Reset your GhostAPI password by opening this link:
${input.resetUrl}

This link expires in 1 hour. If you did not request a password reset, you can ignore this email.`;
}

function passwordResetEmailHtml(input: { name: string | null; resetUrl: string }): string {
  const greeting = input.name ? `Hi ${escapeHtml(input.name)},` : 'Hi,';
  const url = escapeHtml(input.resetUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#030408;color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="color:#a78bfa;font-family:monospace;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">GhostAPI</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">Reset your password</h1>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 24px;">${greeting}</p>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 28px;">Use this secure link to choose a new GhostAPI password.</p>
      <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;padding:14px 18px;font-weight:600;">Reset password</a>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:28px 0 0;">This link expires in 1 hour. If the button does not work, paste this URL into your browser:</p>
      <p style="word-break:break-all;color:#c4b5fd;font-size:13px;line-height:1.6;">${url}</p>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">If you did not request a password reset, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
