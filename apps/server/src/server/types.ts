export type AuthContext = {
  userId: string;
  sessionId: string;
};

export type AppEnv = {
  Bindings: {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: string;
    PORT?: string;
    LOG_LEVEL?: string;
    CORS_ORIGINS?: string;
    APP_URL?: string;
    MAIL_USERNAME?: string;
    MAIL_PASSWORD?: string;
    MAIL_FROM?: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET?: string;
    R2_REGION?: string;
    R2_ENDPOINT_URL: string;
  };
  Variables: {
    auth?: AuthContext;
  };
};
