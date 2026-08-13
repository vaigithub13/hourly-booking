import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import FAQsService from "./product-length.service";
import * as schema from "./product-length.schema";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildRequest } from "../../types/request";
import constants from "../../utils/constants/shared-constants";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const faqsService = FAQsService(fastify);

  instance.get(
    "/",
    {
      preValidation: instance.auth(
        [instance.isAuthenticated, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getProductLengths,
    },
    async (request: FastifyRequestTypebox<typeof schema.getProductLengths>) => {
      const response = await faqsService.findAll(
        buildRequest(request.query, request.headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.post(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        { relation: "and" }
      ),
      schema: schema.createProductLength,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.createProductLength>
    ) => {
      const response = await faqsService.create(
        buildRequest(request.body, constants.ADMIN_MAIN_LANG, request)
      );
      return response;
    }
  );

  instance.put(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        { relation: "and" }
      ),
      schema: schema.updateProductLength,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.updateProductLength>
    ) => {
      const response = await faqsService.update(
        buildRequest(
          { id: request.params.id, ...request.body },
          constants.ADMIN_MAIN_LANG,
          request
        )
      );
      return response;
    }
  );

  instance.delete(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        { relation: "and" }
      ),
      schema: schema.deleteProductLength,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.deleteProductLength>
    ) => {
      const response = await faqsService.delete(
        buildRequest(request.params.id, constants.ADMIN_MAIN_LANG, request)
      );
      return response;
    }
  );
};
