import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as schema from "./configuration.schema";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { buildRequest } from "./../../types/request";
import constants from "./../../utils/constants/shared-constants";
import ConfigurationService from "./configuration.service";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const configurationService = ConfigurationService(fastify);

	instance.get(
		"",
		{
			schema: schema.getGlobalConfigurations,
			preValidation: instance.auth([instance.isAuthenticated], {
				relation: "and",
			}),
		},
		async (request: FastifyRequestTypebox<typeof schema.getGlobalConfigurations>) => {
			const response = await configurationService.getGlobalConfigs(buildRequest({}, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.put(
		"",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.EditGlobalConfigs,
		},
		async (request: FastifyRequestTypebox<typeof schema.EditGlobalConfigs>) => {
			const response = await configurationService.editGlobalConfigs(buildRequest(request.body, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);
};
