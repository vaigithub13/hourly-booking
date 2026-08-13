import { FastifyInstance } from "fastify";
import * as schema from "./FAQ.schema";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import FAQService from "./FAQ.service";
import { buildPaginationRequest, buildRequest } from "src/types/request";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const FaqService = FAQService(fastify);

	instance.get(
		"/all",
		{
			schema: schema.getAllFAQs,
		},
		async (request: FastifyRequestTypebox<typeof schema.getAllFAQs>) => {
			const langCode = request.headers["x-lang"];

			const { limit, offset } = request.query;

			return await FaqService.getAllFAQs(buildPaginationRequest(limit, offset, langCode, request));
		}
	);
	instance.post(
		"/",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.addOrUpdateFAQ,
		},
		async (request: FastifyRequestTypebox<typeof schema.addOrUpdateFAQ>) => {
			const langCode = request.headers["x-lang"];

			const data = request.body;

			return await FaqService.addOrUpdateFAQ(buildRequest(data, langCode, request));
		}
	);
	instance.delete(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.deleteById,
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteById>) => {
			const langCode = request.headers["x-lang"];

			const { id } = request.params;

			return await FaqService.deleteById(buildRequest(id, langCode, request));
		}
	);
};
