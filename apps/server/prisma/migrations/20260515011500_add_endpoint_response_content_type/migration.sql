ALTER TABLE "endpoint_responses"
ADD COLUMN "content_type" TEXT NOT NULL DEFAULT 'application/json';

DROP INDEX "endpoint_responses_endpoint_id_status_key";

CREATE UNIQUE INDEX "endpoint_responses_endpoint_id_status_content_type_key"
ON "endpoint_responses"("endpoint_id", "status", "content_type");
