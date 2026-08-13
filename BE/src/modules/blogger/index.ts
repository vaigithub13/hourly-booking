import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import BloggersService from "./blogger.service";
import * as schema from "./blogger.schema";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildRequest } from "../../types/request";
import constants from "../../utils/constants/shared-constants";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const bloggersService = BloggersService(fastify);

	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.isAuthenticated, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getBloggers,
		},

		async (request: FastifyRequestTypebox<typeof schema.getBloggers>) => {
			const response = await bloggersService.findAll(buildRequest(request.query, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.get(
		"/admin",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.getBloggersAdmin,
		},
		async (request: FastifyRequestTypebox<typeof schema.getBloggersAdmin>) => {
			const response = await bloggersService.adminFindAll(buildRequest(request.query, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.createBlogger,
		},
		async (request: FastifyRequestTypebox<typeof schema.createBlogger>) => {
			const response = await bloggersService.create(buildRequest(request.body, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);

	instance.put(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.updateBlogger,
		},
		async (request: FastifyRequestTypebox<typeof schema.updateBlogger>) => {
			const response = await bloggersService.update(
				buildRequest({ id: request.params.id, ...request.body }, constants.ADMIN_MAIN_LANG, request)
			);
			return response;
		}
	);
	instance.delete(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.deleteBlogger,
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteBlogger>) => {
			const response = await bloggersService.delete(buildRequest(request.params.id, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);
};
