import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import CustomAttributesService from "./custom_attributes.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import * as schema from "./custom_attributes.schema";
import { buildPaginationRequest, buildRequest } from "../../types/request";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const customAttributesService = CustomAttributesService(fastify);

  instance.get(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        {
          relation: "and",
        }
      ),
      schema: schema.getCustomAttributes,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.getCustomAttributes>
    ) => {
      const langCode = request.headers["x-lang"];

      const banners = await customAttributesService.getAll(
        buildRequest(request.query, langCode, request)
      );
      return banners;
    }
  );

  instance.post(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        {
          relation: "and",
        }
      ),
      schema: schema.createCustomAttributes,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.createCustomAttributes>
    ) => {
      const { body, headers } = request;
      const response = await customAttributesService.createCustomAttributes(
        buildRequest(body, headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.patch(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        {
          relation: "and",
        }
      ),
      schema: schema.editCustomAttributes,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.editCustomAttributes>
    ) => {
      const { body, headers, params } = request;
      const response = await customAttributesService.editCustomAttributes(
        buildRequest({ ...body, ...params }, headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.delete(
    "/:id",
    {
      schema: schema.removeCustomAttributes,
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeAdmin],
        {
          relation: "and",
        }
      ),
    },
    async (
      request: FastifyRequestTypebox<typeof schema.removeCustomAttributes>
    ) => {
      const { headers } = request;
      const response = await customAttributesService.removeCustomAttributes(
        buildRequest(request.params.id, headers["x-lang"], request)
      );
      return response;
    }
  );
};
