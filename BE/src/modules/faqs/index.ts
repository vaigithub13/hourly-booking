import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import FAQsService from "./faqs.service";
import * as schema from "./faqs.schema";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { buildRequest } from "./../../types/request";
import constants from "./../../utils/constants/shared-constants";

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
      schema: schema.getFAQs,
    },

    async (request: FastifyRequestTypebox<typeof schema.getFAQs>) => {
      const response = await faqsService.findAll(
        buildRequest(request.query, request.headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.get(
    "/admin",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        { relation: "and" }
      ),
      schema: schema.getFAQsAdmin,
    },
    async (request: FastifyRequestTypebox<typeof schema.getFAQsAdmin>) => {
      const response = await faqsService.adminFindAll(
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
      schema: schema.createFAQ,
    },
    async (request: FastifyRequestTypebox<typeof schema.createFAQ>) => {
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
      schema: schema.updateFAQ,
    },
    async (request: FastifyRequestTypebox<typeof schema.updateFAQ>) => {
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
      schema: schema.deleteFAQ,
    },
    async (request: FastifyRequestTypebox<typeof schema.deleteFAQ>) => {
      const response = await faqsService.delete(
        buildRequest(request.params.id, constants.ADMIN_MAIN_LANG, request)
      );
      return response;
    }
  );
};
