import {
  FastifyRequest,
  FastifyInstance,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyLoggerInstance,
  RawServerDefault,
} from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export type FastifyRequestTypebox<TSchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  TSchema,
  TypeBoxTypeProvider
>;

export type FastifyTypebox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyLoggerInstance,
  TypeBoxTypeProvider
>;
