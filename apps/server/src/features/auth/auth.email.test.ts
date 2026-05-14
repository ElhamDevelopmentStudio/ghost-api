import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendEmail = vi.hoisted(() => vi.fn());
const Resend = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    emails: {
      send: sendEmail,
    },
  })),
);

vi.mock('resend', () => ({ Resend }));

function setValidEnv() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://ghostapi:ghostapi@localhost:5432/ghostapi';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-32';
  process.env.CORS_ORIGINS = 'http://localhost:3002';
  process.env.APP_URL = 'http://localhost:3002';
  process.env.MAIL_USERNAME = 'resend';
  process.env.MAIL_PASSWORD = 're_test_123';
  process.env.MAIL_FROM = 'noreply@example.com';
  process.env.R2_ACCOUNT_ID = 'test-account';
  process.env.R2_ACCESS_KEY_ID = 'test-access-key';
  process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.R2_BUCKET = 'ghostapi-test';
  process.env.R2_REGION = 'auto';
  process.env.R2_ENDPOINT_URL = 'https://test.r2.cloudflarestorage.com';
}

describe('auth email delivery', () => {
  beforeEach(() => {
    vi.resetModules();
    sendEmail.mockReset();
    Resend.mockClear();
    setValidEnv();
  });

  it('fails fast when email delivery is not configured', async () => {
    process.env.MAIL_PASSWORD = '';

    const { ensureEmailDeliveryConfigured } = await import('./auth.email.js');

    expect(() => ensureEmailDeliveryConfigured()).toThrow('Email delivery is not configured.');
    expect(Resend).not.toHaveBeenCalled();
  });

  it('sends verification emails through Resend', async () => {
    sendEmail.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const { sendVerificationEmail } = await import('./auth.email.js');

    await sendVerificationEmail({
      to: 'dev@example.com',
      name: 'Dev <Admin>',
      verificationUrl: 'http://localhost:3002/verify-email/token',
    });

    expect(Resend).toHaveBeenCalledWith('re_test_123');
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'GhostAPI <noreply@example.com>',
        to: 'dev@example.com',
        subject: 'Verify your GhostAPI email',
        html: expect.stringContaining('Hi Dev &lt;Admin&gt;,'),
        text: expect.stringContaining('Hi Dev <Admin>,'),
      }),
    );
  });

  it('sends password reset emails through Resend', async () => {
    sendEmail.mockResolvedValue({ data: { id: 'email_456' }, error: null });

    const { sendPasswordResetEmail } = await import('./auth.email.js');

    await sendPasswordResetEmail({
      to: 'dev@example.com',
      name: null,
      resetUrl: 'http://localhost:3002/reset-password/token',
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Reset your GhostAPI password',
        html: expect.stringContaining('If you did not request a password reset'),
        text: expect.stringContaining('This link expires in 1 hour.'),
      }),
    );
  });

  it('surfaces provider delivery errors', async () => {
    sendEmail.mockResolvedValue({
      data: null,
      error: { message: 'The domain is not verified.' },
    });

    const { sendVerificationEmail } = await import('./auth.email.js');

    await expect(
      sendVerificationEmail({
        to: 'dev@example.com',
        name: null,
        verificationUrl: 'http://localhost:3002/verify-email/token',
      }),
    ).rejects.toThrow('The domain is not verified.');
  });
});
