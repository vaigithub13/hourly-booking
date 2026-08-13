import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildPaginationRequest, buildRequest } from "../../types/request";
import TransactionService from "./transaction.service";
import * as schema from "./transaction.schema";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const transactionService = TransactionService(fastify);

	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.userTransactions,
		},
		async (request: FastifyRequestTypebox<typeof schema.userTransactions>) => {
			const langCode = request.headers["x-lang"];

			const banners = await transactionService.getUserTransactions(
				buildPaginationRequest(request.query.limit, request.query.offset, langCode, request, request.query.vendorId)
			);
			return banners;
		}
	);

	instance.post(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.createTransaction,
		},
		async (request: FastifyRequestTypebox<typeof schema.createTransaction>) => {
			const { body, headers } = request;
			const response = await transactionService.createTransaction(buildRequest(body, headers["x-lang"], request));
			return response;
		}
	);

	instance.patch(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.updateTransactionAttachment,
		},
		async (request: FastifyRequestTypebox<typeof schema.updateTransactionAttachment>) => {
			const { body, headers, params } = request;
			const response = await transactionService.updateTransactionAttachment(
				buildRequest({ ...body, ...(params as any) }, headers["x-lang"], request)
			);
			return response;
		}
	);

	instance.delete(
		"/:id",
		{
			schema: schema.deleteById,
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteById>) => {
			const { headers } = request;
			const response = await transactionService.deleteTransactionById(buildRequest(request.params.id!, headers["x-lang"], request));
			return response;
		}
	);
};
