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

export async function sendProjectInvitationEmail(input: {
  to: string;
  inviterName: string | null;
  projectName: string;
  role: string;
  invitationUrl: string;
  recipientExists: boolean;
}): Promise<void> {
  const inviter = input.inviterName?.trim() || 'A GhostAPI teammate';
  const role = input.role.toLowerCase();
  const body = input.recipientExists
    ? `${inviter} added this email address to the ${input.projectName} project with ${role} access.`
    : `${inviter} added this email address to the ${input.projectName} project with ${role} access. Create a GhostAPI account with this same email address to accept the project access.`;

  await sendAuthEmail({
    to: input.to,
    subject: `${inviter} invited you to ${input.projectName}`,
    html: actionEmailHtml({
      name: null,
      url: input.invitationUrl,
      title: `Project invitation: ${input.projectName}`,
      body,
      actionLabel: input.recipientExists ? 'Review invitation' : 'Create account',
      expiryText: 'This invitation expires in 7 days.',
      footer: `Invitation sent by ${inviter}.`,
    }),
    text: actionEmailText({
      name: null,
      url: input.invitationUrl,
      action: body,
      expiryText: 'This invitation expires in 7 days.',
    }),
    successLog: 'Sent project invitation',
    errorLog: 'Failed to send project invitation',
    errorFallback: 'Unable to send project invitation email.',
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
    replyTo: e.MAIL_FROM,
    subject: input.subject,
    html: input.html,
    text: input.text,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
    },
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
    ? `        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">${escapeHtml(
        input.footer,
      )}</p>
`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7fb;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(input.title)}</div>
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
        <p style="color:#6b7280;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 20px;">GhostAPI</p>
        <h1 style="color:#111827;font-size:24px;line-height:1.3;margin:0 0 18px;">${escapeHtml(input.title)}</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 18px;">${greeting}</p>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">${escapeHtml(input.body)}</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 16px;font-size:15px;font-weight:600;">${escapeHtml(input.actionLabel)}</a>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">${escapeHtml(input.expiryText)} If the button does not work, paste this URL into your browser:</p>
        <p style="word-break:break-all;color:#4f46e5;font-size:13px;line-height:1.6;margin:8px 0 0;">${url}</p>
${footer}
      </div>
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
