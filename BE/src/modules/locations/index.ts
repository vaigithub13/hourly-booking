import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import LocationsService from "./locations.service";
import * as schema from "./locations.schema";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { buildRequest } from "./../../types/request";
import constants from "./../../utils/constants/shared-constants";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const locationsService = LocationsService(fastify);

  instance.get(
    "/",
    {
      preValidation: instance.auth(
        [instance.isAuthenticated, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getLocations,
    },
    async (request: FastifyRequestTypebox<typeof schema.getLocations>) => {
      const response = await locationsService.getLocations(
        buildRequest(request.query, request.headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.post(
    "/",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        { relation: "and" }
      ),
      schema: schema.createLocations,
    },
    async (request: FastifyRequestTypebox<typeof schema.createLocations>) => {
      const response = await locationsService.addLocation(
        buildRequest(request.body, constants.ADMIN_MAIN_LANG, request)
      );
      return response;
    }
  );

  instance.put(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        { relation: "and" }
      ),
      schema: schema.updateLocations,
    },
    async (request: FastifyRequestTypebox<typeof schema.updateLocations>) => {
      const response = await locationsService.editLocation(
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
      schema: schema.deleteLocations,
    },
    async (request: FastifyRequestTypebox<typeof schema.deleteLocations>) => {
      const response = await locationsService.deleteLocation(
        buildRequest(request.params.id, constants.ADMIN_MAIN_LANG, request)
      );
      return response;
    }
  );
};
