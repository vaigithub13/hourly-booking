import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { buildPaginationRequest, buildRequest } from "./../../types/request";
import constants from "./../../utils/constants/shared-constants";
import * as schema from "./user-address.schema";
import UserAddressService from "./user-address.service";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const usersAddressesService = UserAddressService(fastify);

  instance.get(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getMyAddresses,
    },
    async (request: FastifyRequestTypebox<typeof schema.getMyAddresses>) => {
      const langCode = request.headers["x-lang"] as string;
      const { limit, offset } = request.query;
      const response = await usersAddressesService.findAll(
        buildPaginationRequest(limit, offset, langCode, request, {
          userId: request.user.id,
        })
      );
      return response;
    }
  );

  instance.post(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeUser],
        {
          relation: "and",
        }
      ),
      schema: schema.createUserAddress,
    },
    async (request: FastifyRequestTypebox<typeof schema.createUserAddress>) => {
      const langCode = request.headers["x-lang"] as string;
      const response = await usersAddressesService.create(
        buildRequest(
          { ...request.body, userId: request.user.id },
          langCode,
          request
        )
      );
      return response;
    }
  );

  instance.put(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeUser],
        {
          relation: "and",
        }
      ),
      schema: schema.updateUserAddress,
    },
    async (request: FastifyRequestTypebox<typeof schema.updateUserAddress>) => {
      const langCode = request.headers["x-lang"] as string;
      const response = await usersAddressesService.update(
        buildRequest(
          { ...request.body, userId: request.user.id, id: request.params.id },
          langCode,
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
        [instance.authenticate, instance.authorizeUser],
        {
          relation: "and",
        }
      ),
      schema: schema.deleteUserAddress,
    },
    async (request: FastifyRequestTypebox<typeof schema.deleteUserAddress>) => {
      const langCode = request.headers["x-lang"] as string;
      const response = await usersAddressesService.delete(
        buildRequest(request.params.id, langCode, request)
      );
      return response;
    }
  );
};
