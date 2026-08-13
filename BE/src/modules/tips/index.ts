import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildRequest } from "../../types/request";
import constants from "../../utils/constants/shared-constants";
import TipsService from "./tips.service";
import * as schema from "./tips.schema";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const tipsService = TipsService(fastify);

	instance.get(
		"/",
		{
			schema: schema.getTips,
			preValidation: instance.auth([instance.isAuthenticated], {
				relation: "and",
			}),
		},
		async (request: FastifyRequestTypebox<typeof schema.getTips>) => {
			const langCode = request.headers["x-lang"];
			const response = await tipsService.getGlobalConfigs(buildRequest({}, langCode, request));
			return response;
		}
	);

	instance.put(
		"",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.EditTips,
		},
		async (request: FastifyRequestTypebox<typeof schema.EditTips>) => {
			const response = await tipsService.editGlobalConfigs(buildRequest(request.body, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);
};
