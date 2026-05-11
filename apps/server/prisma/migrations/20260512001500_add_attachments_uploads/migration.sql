-- CreateEnum
CREATE TYPE "attachment_purpose" AS ENUM ('PROJECT_AVATAR', 'USER_AVATAR', 'WORKSPACE_ATTACHMENT');

-- CreateEnum
CREATE TYPE "attachment_status" AS ENUM ('PENDING', 'READY');

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "purpose" "attachment_purpose" NOT NULL,
    "status" "attachment_status" NOT NULL DEFAULT 'PENDING',
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "object_key" TEXT NOT NULL,
    "thumbnail_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachments_object_key_key" ON "attachments"("object_key");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_thumbnail_key_key" ON "attachments"("thumbnail_key");

-- CreateIndex
CREATE INDEX "attachments_owner_id_purpose_idx" ON "attachments"("owner_id", "purpose");

-- CreateIndex
CREATE INDEX "attachments_status_idx" ON "attachments"("status");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
