import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import BannerService from "./banner.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import * as schema from "./banner.schema";
import { buildPaginationRequest, buildRequest } from "../../types/request";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const bannerService = BannerService(fastify);

	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.isAuthenticated, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getBanners,
		},
		async (request: FastifyRequestTypebox<typeof schema.getBanners>) => {
			const langCode = request.headers["x-lang"];

			const banners = await bannerService.getAll(buildRequest(request.query, langCode, request));
			return banners;
		}
	);

	instance.get(
		"/:id",
		{
			preValidation: instance.auth([instance.isAuthenticated, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getBannerById,
		},
		async (request: FastifyRequestTypebox<typeof schema.getBannerById>) => {
			const response = await bannerService.getDetails(buildRequest(request.params.id, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.get(
		"/admin",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getBannersForAdmin,
		},
		async (request: FastifyRequestTypebox<typeof schema.getBanners>) => {
			const langCode = request.headers["x-lang"];

			const banners = await bannerService.getAllAdmin(buildRequest(request.query, langCode, request));
			return banners;
		}
	);

	instance.get(
		"/admin/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getBannerByIdForAdmin,
		},
		async (request: FastifyRequestTypebox<typeof schema.getBannerById>) => {
			const response = await bannerService.getDetailsAdmin(buildRequest(request.params.id, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/",
		{
			// preValidation: instance.auth(
			//   [instance.authenticate, instance.denyBlockedUser],
			//   {
			//     relation: "and",
			//   }
			// ),
			schema: schema.createBanner,
		},
		async (request: FastifyRequestTypebox<typeof schema.createBanner>) => {
			const { body, headers } = request;
			const response = await bannerService.createBanner(buildRequest(body, headers["x-lang"], request));
			return response;
		}
	);

	instance.patch(
		"/sort",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.sortBanner,
		},
		async (request: FastifyRequestTypebox<typeof schema.sortBanner>) => {
			const { body, headers, params } = request;
			const response = await bannerService.sortBanner(buildRequest({ ...body, ...params }, headers["x-lang"], request));
			return response;
		}
	);

	instance.patch(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.editBanner,
		},
		async (request: FastifyRequestTypebox<typeof schema.editBanner>) => {
			const { body, headers, params } = request;
			const response = await bannerService.editBanner(buildRequest({ ...body, ...params }, headers["x-lang"], request));
			return response;
		}
	);

	instance.delete(
		"/:id",
		{
			schema: schema.removeBanner,
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
		},
		async (request: FastifyRequestTypebox<typeof schema.removeBanner>) => {
			const { headers } = request;
			const response = await bannerService.removeBanner(buildRequest(request.params.id, headers["x-lang"], request));
			return response;
		}
	);
};
