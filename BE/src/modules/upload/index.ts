import { FastifyInstance } from "fastify";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as schema from "./upload.schema";
import { Multipart } from "@fastify/multipart";
import fastifyMultipart from "@fastify/multipart";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  await instance.register(fastifyMultipart, {
    attachFieldsToBody: true,
    sharedSchemaId: "#mySharedSchema",
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    throwFileSizeLimit: true,
  });

  instance.post(
    "/",
    {
      schema: schema.uploadApi,
    },
    async (request: FastifyRequestTypebox<typeof schema.uploadApi>) => {
      const files = request.body.files;
      const response = await instance.uploadFile(
        Array.isArray(files) ? (files as Multipart[]) : [files as Multipart],
        "general"
      );
      return response.map((e) => instance.getPictureURL(e));
    }
  );
};
