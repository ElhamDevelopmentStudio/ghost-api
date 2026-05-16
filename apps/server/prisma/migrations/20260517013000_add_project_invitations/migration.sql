CREATE TYPE "project_invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

CREATE TABLE "project_invitations" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "role" "project_role" NOT NULL,
  "token_hash" TEXT NOT NULL,
  "status" "project_invitation_status" NOT NULL DEFAULT 'PENDING',
  "inviter_id" UUID NOT NULL,
  "accepted_by_id" UUID,
  "accepted_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_invitations_token_hash_key" ON "project_invitations"("token_hash");
CREATE INDEX "project_invitations_project_id_email_idx" ON "project_invitations"("project_id", "email");
CREATE INDEX "project_invitations_inviter_id_idx" ON "project_invitations"("inviter_id");
CREATE INDEX "project_invitations_accepted_by_id_idx" ON "project_invitations"("accepted_by_id");
CREATE INDEX "project_invitations_status_expires_at_idx" ON "project_invitations"("status", "expires_at");

ALTER TABLE "project_invitations"
ADD CONSTRAINT "project_invitations_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_invitations"
ADD CONSTRAINT "project_invitations_inviter_id_fkey"
FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_invitations"
ADD CONSTRAINT "project_invitations_accepted_by_id_fkey"
FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
