export type AuthContext = {
  userId: string;
  sessionId: string;
};

export type AppEnv = {
  Variables: {
    auth?: AuthContext;
  };
};
