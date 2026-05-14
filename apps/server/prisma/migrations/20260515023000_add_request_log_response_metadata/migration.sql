ALTER TABLE "request_logs"
ADD COLUMN "response_headers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "response_content_type" TEXT,
ADD COLUMN "response_body" JSONB;
