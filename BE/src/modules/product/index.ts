import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import AttributeService from "./product.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import * as schema from "./product.schema";
import { buildPaginationRequest, buildRequest } from "../../types/request";
import { withTransaction } from "src/utils/sequelize";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const attributeService = AttributeService(fastify);

	instance.get(
		"/",
		{
			// preValidation: instance.auth(
			//   [instance.isAuthenticated, instance.denyBlockedUser],
			//   {
			//     relation: "and",
			//   }
			// ),
			schema: schema.getProducts,
		},
		async (request: FastifyRequestTypebox<typeof schema.getProducts>) => {
			const langCode = request.headers["x-lang"];
			const { limit, offset } = request.query;
			const banners = await attributeService.getAllProducts(buildPaginationRequest(limit, offset, langCode, request, request.query));
			return banners;
		}
	);

	instance.get(
		"/for-vendor",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getProductsForVendor,
		},
		async (request: FastifyRequestTypebox<typeof schema.getProductsForVendor>) => {
			const langCode = request.headers["x-lang"];
			const { limit, offset } = request.query;
			const banners = await attributeService.getAllProductsVendorSide(
				buildPaginationRequest(limit, offset, langCode, request, request.query)
			);
			return banners;
		}
	);

	instance.get(
		"/metadata",
		{
			preValidation: instance.auth([instance.isAuthenticated, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getMetadata,
		},
		async (request: FastifyRequestTypebox<typeof schema.getMetadata>) => {
			const langCode = request.headers["x-lang"];
			const banners = await attributeService.getMetadata(buildRequest(undefined, langCode, request));
			return banners;
		}
	);

	instance.get(
		"/:productId",
		{
			preValidation: instance.auth([instance.isAuthenticated, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getProductbyId,
		},
		async (request: FastifyRequestTypebox<typeof schema.getProductbyId>) => {
			const langCode = request.headers["x-lang"];
			const banners = await attributeService.getProductbyId(buildRequest(request.params.productId, langCode, request));
			return banners;
		}
	);

	instance.get(
		"/for-admin/:productId",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getProductbyId,
		},
		async (request: FastifyRequestTypebox<typeof schema.getProductbyId>) => {
			const langCode = request.headers["x-lang"];
			const banners = await attributeService.getProductbyIdForAdmin(buildRequest(request.params.productId, langCode, request));
			return banners;
		}
	);

	instance.put(
		"/approve/:productId",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.approveProduct,
		},
		async (request: FastifyRequestTypebox<typeof schema.approveProduct>) => {
			const langCode = request.headers["x-lang"];
			const response = await attributeService.approveProduct(buildRequest(request.params.productId, langCode, request));
			return response;
		}
	);

	instance.put(
		"/disapprove/:productId",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.approveProduct,
		},
		async (request: FastifyRequestTypebox<typeof schema.approveProduct>) => {
			const langCode = request.headers["x-lang"];
			const response = await attributeService.disapproveProduct(buildRequest(request.params.productId, langCode, request));
			return response;
		}
	);

	instance.post(
		"/new-product",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.newProduct,
		},
		async (request: FastifyRequestTypebox<typeof schema.newProduct>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest(request.body, langCode, request);
			const { result: product } = await withTransaction(instance.db, attributeService.addNewProductFromVendor, dto);
			return product;
		}
	);

	instance.put(
		"/edit-product",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.editProduct,
		},
		async (request: FastifyRequestTypebox<typeof schema.editProduct>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest(request.body, langCode, request);
			const { result: product } = await withTransaction(instance.db, attributeService.editProductFromVendor, dto);
			return product;
		}
	);

	instance.put(
		"/seed",
		{
			schema: schema.seed,
		},
		async (request: FastifyRequestTypebox<typeof schema.seed>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest(request.body, langCode, request);
			const product = await withTransaction(instance.db, attributeService.seedData, dto);
			return product;
		}
	);

	instance.delete(
		"/:productId",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.deleteProduct,
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteProduct>) => {
			const langCode = request.headers["x-lang"];
			const banners = await attributeService.deleteProduct(buildRequest(request.params.productId, langCode, request));
			return banners;
		}
	);
};
