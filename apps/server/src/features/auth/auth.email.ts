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
  await sendAuthEmail({
    to: input.to,
    subject: 'Verify your GhostAPI email',
    html: actionEmailHtml({
      name: input.name,
      url: input.verificationUrl,
      title: 'Verify your email address',
      body: 'Confirm this email address to finish creating your GhostAPI account.',
      actionLabel: 'Verify email',
      expiryText: 'This link expires in 24 hours.',
    }),
    text: actionEmailText({
      name: input.name,
      url: input.verificationUrl,
      action: 'Verify your GhostAPI email address',
      expiryText: 'This link expires in 24 hours.',
    }),
    successLog: 'Sent email verification',
    errorLog: 'Failed to send email verification',
    errorFallback: 'Unable to send verification email.',
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string | null;
  resetUrl: string;
}): Promise<void> {
  await sendAuthEmail({
    to: input.to,
    subject: 'Reset your GhostAPI password',
    html: actionEmailHtml({
      name: input.name,
      url: input.resetUrl,
      title: 'Reset your password',
      body: 'Use this secure link to choose a new GhostAPI password.',
      actionLabel: 'Reset password',
      expiryText: 'This link expires in 1 hour.',
      footer: 'If you did not request a password reset, you can ignore this email.',
    }),
    text: actionEmailText({
      name: input.name,
      url: input.resetUrl,
      action: 'Reset your GhostAPI password',
      expiryText:
        'This link expires in 1 hour. If you did not request a password reset, you can ignore this email.',
    }),
    successLog: 'Sent password reset email',
    errorLog: 'Failed to send password reset',
    errorFallback: 'Unable to send password reset email.',
  });
}

async function sendAuthEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  successLog: string;
  errorLog: string;
  errorFallback: string;
}): Promise<void> {
  const e = env();

  if (!e.MAIL_PASSWORD) {
    throw new EmailDeliveryError('Email delivery is not configured.');
  }

  resendClient ??= new Resend(e.MAIL_PASSWORD);

  const { data, error } = await resendClient.emails.send({
    from: `GhostAPI <${e.MAIL_FROM}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    logger.error({ error, to: input.to }, input.errorLog);
    throw new EmailDeliveryError(emailErrorMessage(error, input.errorFallback));
  }

  logger.info({ emailId: data?.id, to: input.to }, input.successLog);
}

function emailErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

function actionEmailText(input: {
  name: string | null;
  url: string;
  action: string;
  expiryText: string;
}): string {
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  return `${greeting}

${input.action} by opening this link:
${input.url}

${input.expiryText}`;
}

function actionEmailHtml(input: {
  name: string | null;
  url: string;
  title: string;
  body: string;
  actionLabel: string;
  expiryText: string;
  footer?: string;
}): string {
  const greeting = input.name ? `Hi ${escapeHtml(input.name)},` : 'Hi,';
  const url = escapeHtml(input.url);
  const footer = input.footer
    ? `      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:24px 0 0;">${escapeHtml(
        input.footer,
      )}</p>
`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;background:#030408;color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="color:#a78bfa;font-family:monospace;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">GhostAPI</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">${escapeHtml(input.title)}</h1>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 24px;">${greeting}</p>
      <p style="color:#cbd5e1;font-size:16px;line-height:1.6;margin:0 0 28px;">${escapeHtml(input.body)}</p>
      <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;padding:14px 18px;font-weight:600;">${escapeHtml(input.actionLabel)}</a>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:28px 0 0;">${escapeHtml(input.expiryText)} If the button does not work, paste this URL into your browser:</p>
      <p style="word-break:break-all;color:#c4b5fd;font-size:13px;line-height:1.6;">${url}</p>
${footer}
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
