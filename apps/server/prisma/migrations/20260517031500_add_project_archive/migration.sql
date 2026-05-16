ALTER TABLE "projects" ADD COLUMN "archived_at" TIMESTAMP(3);

CREATE INDEX "projects_archived_at_idx" ON "projects"("archived_at");
