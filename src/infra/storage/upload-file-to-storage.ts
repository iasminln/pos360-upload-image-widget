import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import { env } from "@/env";
import { Upload } from "@aws-sdk/lib-storage";
import { z } from "zod";
import { r2 } from "./client";

export const uploadFileToStorageInput = z.object({
  folder: z.enum(["images", "downloads"]),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>;

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  const { folder, fileName, contentType, contentStream } = uploadFileToStorageInput.parse(input);

  const fileExtensions = extname(fileName);
  const fileNameWithoutExtension = basename(fileName);

  const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9]/g, "-");
  const sanitizedFileNameWithExtension = `${sanitizedFileName}${fileExtensions}`;

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`;

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: uniqueFileName,
      Body: contentStream,
      ContentType: contentType,
    },
  });

  await upload.done();

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
  };
}
