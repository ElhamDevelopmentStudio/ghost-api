import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../../env.js';

let cachedClient: S3Client | undefined;

export function r2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const e = env();
  cachedClient = new S3Client({
    region: e.R2_REGION,
    endpoint: e.R2_ENDPOINT_URL,
    credentials: {
      accessKeyId: e.R2_ACCESS_KEY_ID,
      secretAccessKey: e.R2_SECRET_ACCESS_KEY,
    },
  });

  return cachedClient;
}

export async function signedPutUrl(input: {
  contentLength: number;
  contentType: string;
  key: string;
}): Promise<string> {
  const e = env();
  return getSignedUrl(
    r2Client(),
    new PutObjectCommand({
      Bucket: e.R2_BUCKET,
      Key: input.key,
      ContentLength: input.contentLength,
      ContentType: input.contentType,
    }),
    { expiresIn: 5 * 60 },
  );
}

export async function signedGetUrl(key: string): Promise<string> {
  return getSignedUrl(
    r2Client(),
    new GetObjectCommand({
      Bucket: env().R2_BUCKET,
      Key: key,
    }),
    { expiresIn: 5 * 60 },
  );
}

export async function headObject(key: string) {
  return r2Client().send(
    new HeadObjectCommand({
      Bucket: env().R2_BUCKET,
      Key: key,
    }),
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const response = await r2Client().send(
    new GetObjectCommand({
      Bucket: env().R2_BUCKET,
      Key: key,
    }),
  );

  if (!response.Body) throw new Error('R2 object has no body');
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function putObject(input: {
  body: Buffer;
  contentType: string;
  key: string;
}): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: env().R2_BUCKET,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}
