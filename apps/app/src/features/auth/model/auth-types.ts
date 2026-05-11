export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
};

export type AuthResponse = {
  success: true;
  user: AuthUser;
  session: AuthSession;
};

export type RegisterResponse = {
  success: true;
  user: AuthUser;
};

export type ResendVerificationResponse = {
  success: true;
};

export type SuccessResponse = {
  success: true;
};

export type ForgotPasswordResponse = SuccessResponse;

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
