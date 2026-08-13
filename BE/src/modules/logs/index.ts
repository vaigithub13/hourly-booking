import { FastifyInstance } from "fastify";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { buildPaginationRequest, buildRequest } from "./../../types/request";
import * as schema from "./logs.schema";
import LogsService from "./logs.service";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const logsService = LogsService(fastify);

	// Get all logs with filtering and pagination
	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.getAllLogs,
		},
		async (request: FastifyRequestTypebox<typeof schema.getAllLogs>) => {
			const { limit, offset } = request.query;
			const response = await logsService.findAll(
				buildPaginationRequest(limit, offset, request.headers["x-lang"], request, request.query)
			);
			return response;
		}
	);

	// Get a specific log by ID
	instance.get(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.getLogById,
		},
		async (request: FastifyRequestTypebox<typeof schema.getLogById>) => {
			const log = await logsService.findById(request.params.id);
			return log;
		}
	);
};
