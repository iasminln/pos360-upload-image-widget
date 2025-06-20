import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { isLeft, isRight, unwrapEither } from "@/shared/either";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidFileFormat } from "./errors/invalid-file-format";
import { uploadImage } from "./upload-image";

describe("uploadImage", () => {
  beforeEach(() => {
    vi.mock("@/infra/storage/upload-file-to-storage", () => {
      return {
        uploadFileToStorage: vi.fn().mockImplementation(() => {
          return {
            key: `${randomUUID()}-test.png`,
            url: "https://test.com/test.png",
          };
        }),
      };
    });
  });

  it("should upload an image", async () => {
    const fileName = `${randomUUID()}-test.png`;

    const sut = await uploadImage({
      fileName,
      contentType: "image/png",
      contentStream: Readable.from([]),
    });

    expect(isRight(sut)).toBe(true);

    const result = await db.select().from(schema.uploads).where(eq(schema.uploads.name, fileName));

    expect(result).toHaveLength(1);
  });

  it("should not upload an invalid file", async () => {
    const fileName = `${randomUUID()}-test.pdf`;

    const sut = await uploadImage({
      fileName,
      contentType: "document/pdf",
      contentStream: Readable.from([]),
    });

    expect(isLeft(sut)).toBe(true);
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat);
  });
});
