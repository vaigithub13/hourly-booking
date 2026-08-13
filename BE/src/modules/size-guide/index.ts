import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as schema from "./size-guide.schema";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildRequest } from "../../types/request";
import constants from "../../utils/constants/shared-constants";
import SizeGuideService from "./size-guide.service";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const sizeGuideService = SizeGuideService(fastify);

	instance.get(
		"/",
		{
			schema: schema.getSizeGuide,
			preValidation: instance.auth([instance.isAuthenticated], {
				relation: "and",
			}),
		},
		async (request: FastifyRequestTypebox<typeof schema.getSizeGuide>) => {
			const langCode = request.headers["x-lang"];
			const response = await sizeGuideService.getGlobalConfigs(buildRequest({}, langCode, request));
			return response;
		}
	);

	instance.put(
		"",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.EditSizeGuides,
		},
		async (request: FastifyRequestTypebox<typeof schema.EditSizeGuides>) => {
			const response = await sizeGuideService.editGlobalConfigs(buildRequest(request.body, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);
};
