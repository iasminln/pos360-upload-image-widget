import { randomUUID } from "node:crypto";
import { isRight, unwrapEither } from "@/shared/either";
import { makeUpload } from "@/test/factories/make-upload";
import { describe, expect, it } from "vitest";
import { getUploads } from "./get-uploads";
import dayjs from 'dayjs'

describe("get uploads", () => {
  it("should return all uploads", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({ name: `${namePattern}.webp` });
    const upload2 = await makeUpload({ name: `${namePattern}.webp` });
    const upload3 = await makeUpload({ name: `${namePattern}.webp` });
    const upload4 = await makeUpload({ name: `${namePattern}.webp` });
    const upload5 = await makeUpload({ name: `${namePattern}.webp` });

    const sut = await getUploads({ searchQuery: namePattern });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toHaveLength(5);
    expect(unwrapEither(sut).uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: upload1.id }),
        expect.objectContaining({ id: upload2.id }),
        expect.objectContaining({ id: upload3.id }),
        expect.objectContaining({ id: upload4.id }),
        expect.objectContaining({ id: upload5.id }),
      ]),
    );
  });

  it("should return paginated uploads", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({ name: `${namePattern}.webp` });
    const upload2 = await makeUpload({ name: `${namePattern}.webp` });
    const upload3 = await makeUpload({ name: `${namePattern}.webp` });
    const upload4 = await makeUpload({ name: `${namePattern}.webp` });
    const upload5 = await makeUpload({ name: `${namePattern}.webp` });

    let sut = await getUploads({
      searchQuery: namePattern,
      page: 1,
      pageSize: 3,
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: upload5.id }),
        expect.objectContaining({ id: upload4.id }),
        expect.objectContaining({ id: upload3.id }),
      ]),
    );

    sut = await getUploads({
      searchQuery: namePattern,
      page: 2,
      pageSize: 3,
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: upload2.id }),
        expect.objectContaining({ id: upload1.id }),
      ]),
    );
  });

  it("should return sorted uploads", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: new Date(),
    });
    const upload2 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(1, "days").toDate(),
    });
    const upload3 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(2, "days").toDate(),
    });
    const upload4 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(3, "days").toDate(),
    });
    const upload5 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(4, "days").toDate(),
    });

    let sut = await getUploads({
      searchQuery: namePattern,
      sortBy: "createdAt",
      sortDirection: "asc",
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: upload5.id }),
        expect.objectContaining({ id: upload4.id }),
        expect.objectContaining({ id: upload3.id }),
        expect.objectContaining({ id: upload2.id }),
        expect.objectContaining({ id: upload1.id }),
      ]),
    );

    sut = await getUploads({
      searchQuery: namePattern,
      sortBy: "createdAt",
      sortDirection: "desc",
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: upload1.id }),
        expect.objectContaining({ id: upload2.id }),
        expect.objectContaining({ id: upload3.id }),
        expect.objectContaining({ id: upload4.id }),
        expect.objectContaining({ id: upload5.id }),
      ]),
    );
  });
});
