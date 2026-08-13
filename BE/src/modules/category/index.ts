import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import CategoryService from "./category.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import * as schema from "./category.schema";
import { buildPaginationRequest, buildRequest } from "../../types/request";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const categoryService = CategoryService(fastify);

  instance.get(
    "/",
    {
      preValidation: instance.auth(
        [instance.isAuthenticated, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getCategory,
    },
    async (request: FastifyRequestTypebox<typeof schema.getCategory>) => {
      const langCode = request.headers["x-lang"];

      const banners = await categoryService.getAll(
        buildRequest(undefined, langCode, request)
      );
      return banners;
    }
  );

  instance.post(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.createCategory,
    },
    async (request: FastifyRequestTypebox<typeof schema.createCategory>) => {
      const { body, headers } = request;
      const response = await categoryService.createCategory(
        buildRequest(body, headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.patch(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.editCategory,
    },
    async (request: FastifyRequestTypebox<typeof schema.editCategory>) => {
      const { body, headers, params } = request;
      const response = await categoryService.editCategory(
        buildRequest({ ...body, ...params }, headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.delete(
    "/:id",
    {
      schema: schema.removeCategory,
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
    },
    async (request: FastifyRequestTypebox<typeof schema.removeCategory>) => {
      const { headers } = request;
      const response = await categoryService.removeCategory(
        buildRequest(request.params.id, headers["x-lang"], request)
      );
      return response;
    }
  );
};
