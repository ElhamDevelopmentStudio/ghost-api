ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMP(3);

CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_verifications_token_hash_key" ON "email_verifications"("token_hash");
CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications"("user_id");
CREATE INDEX "email_verifications_expires_at_idx" ON "email_verifications"("expires_at");

ALTER TABLE "email_verifications"
  ADD CONSTRAINT "email_verifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
