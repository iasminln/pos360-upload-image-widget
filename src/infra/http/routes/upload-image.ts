import { uploadImage } from "@/app/functions/upload-image";
import { isRight, unwrapEither } from "@/shared/either";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/uploads",
    {
      schema: {
        summary: "Upload an image",
        consumes: ["multipart/form-data"],
        response: {
          201: z.object({ uploadId: z.string() }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 5, // 5MB
        },
      });

      if (!uploadFile) {
        return reply.status(400).send({ message: "File is required" });
      }

      const result = await uploadImage({
        fileName: uploadFile.filename,
        contentType: uploadFile.mimetype,
        contentStream: uploadFile.file,
      });

      if (uploadFile.file.truncated) {
        return reply.status(400).send({ message: "File is too large" });
      }

      if (isRight(result)) {
        console.log(unwrapEither(result));

        return reply.status(200).send();
      }

      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case "InvalidFileFormat":
          return reply.status(400).send({ message: error.message });
      }
    },
  );
};
