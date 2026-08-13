import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Logger } from "aws-sdk/lib/config-base";
import { FastifyInstance } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

let fastifyInstance: FastifyInstance;

export const setFastifyInstance = (
  instance: FastifyInstance<
    Server<typeof IncomingMessage, typeof ServerResponse>,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    any,
    TypeBoxTypeProvider
  >
) => {
  fastifyInstance = instance;
};

export const getFastifyInstance = (): FastifyInstance => {
  if (!fastifyInstance) {
    throw new Error("Fastify instance is not set yet.");
  }
  return fastifyInstance;
};
