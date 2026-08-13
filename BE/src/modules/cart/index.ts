import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import CartsService from "./cart.service";
import * as schema from "./cart.schema";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";
import { buildRequest } from "src/types/request";
import { withTransaction } from "src/utils/sequelize";
import ProductLengthsService from "../product-length/product-length.service";
import { ProductLength } from "../product-length/product-length.model";
import UserAddressService from "../user-address/user-address.service";
import ConfigurationService from "../configuration/configuration.service";
import { translateMessage } from "src/utils/common-methods";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const cartService = CartsService(fastify);

	instance.get(
		"/my-cart",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.getUserCart,
		},
		async (request: FastifyRequestTypebox<typeof schema.getUserCart>) => {
			const langCode = request.headers["x-lang"];

			let response = await cartService.findUserCart(buildRequest(request.user.id, langCode, request));

			//If the cart has not user address related to it then check if there's default user address
			if (!response.userAddressId) {
				console.log("default address not provided");
				response = await cartService.assignDefaultAddressToCart({
					cartId: response.id,
					langCode,
				});
			} else {
				console.log("default address not provided");
				response = await cartService.assignDeliveryChargeForCartResponse({
					cartId: response.id,
					langCode,
				});
			}
			return response;
		}
	);

	instance.post(
		"/add-cart-item",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.addCartItem,
		},
		async (request: FastifyRequestTypebox<typeof schema.addCartItem>) => {
			const langCode = request.headers["x-lang"];

			const { quantity, skuId, removeDiffVendorItems, productId, colorId, sizeId, lengthId } = request.body;

			// Checking if selected length of app is available

			const dto = buildRequest(
				{
					userId: request.user.id,
					skuId,
					productId,
					lengthId,
					colorId,
					sizeId,
					removeDiffVendorItems,
					quantity,
				},
				langCode,
				request
			);
			const { result: response } = await withTransaction(instance.db, cartService.addCartItem, dto);
			return response;
		}
	);

	instance.post(
		"/validate-cart",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.validateCart,
		},
		async (request: FastifyRequestTypebox<typeof schema.validateCart>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest({ userId: request.user.id }, langCode, request);
			const response = await cartService.checkAndValidateCart(dto);
			return response;
		}
	);

	instance.post(
		"/edit-cart",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.editCart,
		},
		async (request: FastifyRequestTypebox<typeof schema.editCart>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest({ userId: request.user.id, ...request.body }, langCode, request);
			const { result: response } = await withTransaction(instance.db, cartService.editCart, dto);
			return response;
		}
	);

	instance.post(
		"/remove-cart-item",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.removeItemFromCart,
		},
		async (request: FastifyRequestTypebox<typeof schema.removeItemFromCart>) => {
			const langCode = request.headers["x-lang"];
			const dto = buildRequest({ userId: request.user.id, ...request.body }, langCode, request);
			const { result: response } = await withTransaction(instance.db, cartService.removeItemFromCart, dto);
			return response;
		}
	);

	instance.post(
		"/clear-cart",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.clearMyCart,
		},
		async (request: FastifyRequestTypebox<typeof schema.clearMyCart>) => {
			const langCode = request.headers["x-lang"];
			const cart = await cartService.findOrCreateForUser({
				userId: request.user.id,
			});
			await cartService.clearCart({ cart });
			return {
				message: translateMessage("common.response.success", langCode),
			};
		}
	);
};
