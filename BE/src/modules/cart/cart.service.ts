import { FastifyInstance } from "fastify";
import { FindOptions, Op, Transaction, WhereOptions } from "sequelize";
import { Cart, CartItem } from "./cart.model";
import { RequestData } from "src/types/request";
import { CartFilterService } from "./utils/cart-filter-service";
import { IAddItemToCartDto, ICartResponse, IEditCartDto, IRemoveItemFromCartDto, IValidateCartDto, cartResponse } from "./cart.dto";
import { cartIncludes, cartItemIncludes } from "./utils/fetchables";
import { Product, SKU } from "../product/product.model";
import AttributeService from "../product/product.service";
import { translateMessage } from "src/utils/common-methods";
import UserAddressService from "../user-address/user-address.service";
import ConfigurationService from "../configuration/configuration.service";
import CustomAttributesService from "../custom_attributes/custom_attributes.service";
import { CustomAttribute } from "aws-sdk/clients/acmpca";
import { CustomAttributes } from "../custom_attributes/custom_attributes.model";
import ProductService from "../product/product.service";
import axios from "axios";
import { Configuration } from "../configuration/configuration.model";

// This module is dedicated for users of the mobile app (customers only)

export const CartsService = (instance: FastifyInstance) => {
	const privateMethods = {
		addItemSingleVendorValidation: (data: { cart: Cart; newSkuItem: SKU | null; product: Product | null }) => {
			const { cart, newSkuItem, product } = data;
			if (!newSkuItem && !product) return true;
			if (!cart.get("items").length) return true;
			const vendorId = cart.get("items")[0].sku?.product?.vendorId || cart.get("items")[0].product?.vendorId;
			if (newSkuItem) {
				// it is sufficient to validate the item because all items in cart should belong to one vendor
				return vendorId === newSkuItem.get("product").get("vendorId");
			}

			return vendorId === product?.vendorId;
		},

		destroyProductsRelatedToDifferentVendor: async (data: { vendorId: number; transaction: Transaction }) => {
			const { vendorId, transaction } = data;
			const cartItemsToDestroy = await CartItem.findAll({
				where: {
					[Op.or]: [{ "$product.vendorId$": { [Op.ne]: vendorId } }, { "$sku->product.vendorId$": { [Op.ne]: vendorId } }],
				},
				include: [
					{
						model: Product,
						as: "product",
						required: false, // optional to allow OR condition
					},
					{
						model: SKU,
						as: "sku",
						required: false,
						include: [
							{
								model: Product,
								as: "product",
								required: false,
							},
						],
					},
				],
				transaction,
			});
			console.log(cartItemsToDestroy);
			for (const item of cartItemsToDestroy) await item.destroy({ transaction });
			return;
		},
	};
	const service = {
		clearCart: async (data: { cart: Cart; transaction?: Transaction }) => {
			const { cart, transaction } = data;
			await CartItem.destroy({
				where: { cartId: cart.get("id") },
				transaction,
			});
			await cart.update(
				{
					finalPrice: 0,
					grossTotal: 0,
					subTotal: 0,
					totalDiscount: 0,
				},
				{ transaction }
			);
			return;
		},

		// Service to assign a default address of user as and address of the cart.
		assignDefaultAddressToCart: async (data: { cartId: number; langCode: string }) => {
			const { cartId, langCode } = data;
			let cart = (await service.findById({
				id: cartId,
				fullInfo: true,
				throwError: true,
			})) as Cart;
			const userAddressService = UserAddressService(instance);
			const defaultAddr = await userAddressService.findDefaultAddress({
				throwError: false,
				userId: cart.get("userId"),
			});

			// Checking if there's default address for user
			if (defaultAddr) {
				cart.userAddressId = defaultAddr.get("id");
				await cart.reload();

				/* Checking if default address is inside doha we use the insideDoha price otherwise we 
          use the outside doha (We get them from global configs) */

				const globalConfigService = ConfigurationService(instance);
				const globalConfig = await globalConfigService.find();
				const { price } = await service.calcDeliverFee(cart, globalConfig);
				cart.deliveryCost = price;

				await cart.save();
				cart = (await service.findById({
					id: cart.get("id"),
					throwError: true,
					fullInfo: true,
				})) as Cart;
			}

			return cartResponse({ cart, langCode, multiLang: false });
		},

		// Service to assign the delivery charges for cart based on the address assigned to it.
		assignDeliveryChargeForCartResponse: async (data: { cartId: number; langCode: string }) => {
			const { cartId, langCode } = data;
			let cart = (await service.findById({
				id: cartId,
				fullInfo: true,
				throwError: true,
			})) as Cart;

			const globalConfigsService = ConfigurationService(instance);
			const globalConfigs = await globalConfigsService.find();
			const userAddressService = UserAddressService(instance);
			const userAddress = await userAddressService.findByPk({
				id: cart.get("userAddressId"),
			});

			const globalConfigService = ConfigurationService(instance);
			const globalConfig = await globalConfigService.find();
			const { price } = await service.calcDeliverFee(cart, globalConfig);
			cart.deliveryCost = price;
			console.log(price);
			await cart.save();
			cart = (await service.findById({
				id: cart.get("id"),
				throwError: true,
				fullInfo: true,
			})) as Cart;
			return cartResponse({ cart, langCode, multiLang: false });
		},

		findById: async (data: { id: number; fullInfo?: boolean; transaction?: Transaction; throwError: boolean }) => {
			const { id, fullInfo, transaction, throwError } = data;
			const options: FindOptions<Cart> = { transaction };
			if (fullInfo) {
				options.include = cartIncludes;
			}
			const cart = await Cart.findByPk(id, options);
			if (!cart && throwError) throw instance.httpErrors.notFound("cart.response.notFound");
			return cart;
		},

		findCartItemById: async (data: { id: number; fullInfo?: boolean; transaction?: Transaction; throwError: boolean }) => {
			const { id, fullInfo, transaction, throwError } = data;
			const options: FindOptions<Cart> = { transaction };
			if (fullInfo) {
				options.include = cartItemIncludes;
			}
			const cartItem = await CartItem.findByPk(id, options);
			if (!cartIncludes && throwError) throw instance.httpErrors.notFound("cartItem.response.notFound");
			return cartItem;
		},

		validateCart: async (data: { cart: IEditCartDto; cartId: number; userId: number; transaction?: Transaction }) => {
			const { cart, cartId, userId, transaction } = data;
			const { items } = cart;

			const vendorIdsSet = new Set<number>();
			for (const updatedItem of items) {
				const cartItem = await CartItem.findOne({
					where: { id: updatedItem.id, cartId },
					include: cartItemIncludes,
					transaction,
				});

				if (!cartItem) throw instance.httpErrors.notFound("cartItem.response.notFound");

				if (cartItem.sku) {
					vendorIdsSet.add(cartItem.get("sku").get("product").get("vendorId"));
					// if the updated order quantity is more that we have in store then throw validation error
					if (cartItem.sku.amount !== null && updatedItem.quantity > cartItem.get("sku").get("amount")) {
						throw instance.httpErrors.badRequest("cartItem.response.notEnoughQuantity");
					}
				}

				if (cartItem.product) vendorIdsSet.add(cartItem.get("product").get("vendorId"));
			}

			// Validating that all items in cart should belong to one vendor
			if (vendorIdsSet.size > 1) throw instance.httpErrors.notAcceptable("cart.response.itemsMoreThanVendor");

			return true;
		},

		findOrCreateForUser: async (data: { userId: number; fullInfo?: boolean; transaction?: Transaction }) => {
			const { userId, fullInfo, transaction } = data;
			const options: FindOptions<Cart> = {
				where: new CartFilterService().equals("userId", userId).build(),
				transaction,
			};
			if (fullInfo) {
				options.include = cartIncludes;
			}
			let cart = await Cart.findOne(options);
			if (!cart) {
				await Cart.create(
					{
						userId,
						deliveryCost: 0,
						totalDiscount: 0,
						subTotal: 0,
						grossTotal: 0,
						finalPrice: 0,
					},
					{ transaction }
				);
				cart = await Cart.findOne(options);
			}
			return cart as Cart;
		},

		findUserCart: async (dto: RequestData<number>) => {
			const userId = dto.data;
			const cart = await service.findOrCreateForUser({
				userId,
				fullInfo: true,
			});
			return cartResponse({ cart, langCode: dto.langCode, multiLang: false });
		},

		addCartItem: async (transaction: Transaction, dto: RequestData<IAddItemToCartDto>) => {
			const { data, langCode } = dto;

			// if this flag is false then backend will throw error if the new item and some cart product
			// belong to different vendors
			const { removeDiffVendorItems = false, lengthId, sizeId, colorId } = data; // default value = false

			/* if we don't want to remove items from different vendors automatically, then we need fullInfo, to make the validation */
			let cart = await service.findOrCreateForUser({
				userId: data.userId,
				fullInfo: true,
				transaction,
			});
			let skuItem: SKU | null = null;
			let product: Product | null = null;
			if (data.skuId) {
				const sameItem = cart.get("items").find((item) => item.get("skuId") === data.skuId);

				{
					// Validating the new added item
					const productService = AttributeService(instance);
					skuItem = await productService.findSkuById({
						id: data.skuId,
						fullInfo: true,
						transaction,
					});

					if (!skuItem) throw instance.httpErrors.notFound("product.response.skuNotFound");

					// If it is currently existing item, then we need to consider the old quantity of the currently existing item also
					if (skuItem.amount !== null && data.quantity + (sameItem ? sameItem.get("quantity") : 0) > skuItem.get("amount"))
						throw instance.httpErrors.badRequest("cartItem.response.notEnoughQuantity");

					// Finding if adding item that already exists in the cart

					if (sameItem) {
						// then we increase the item count in our cart by 1 and return
						let newTotalItemPrice =
							(sameItem.get("sku").get("product").get("price") * data.quantity || 0) + sameItem.get("totalPrice");
						let totalDiscountCartItem =
							(sameItem.get("sku").get("product").get("discountedPrice") * data.quantity || 0) +
							sameItem.get("totalDiscount");
						await sameItem.update({
							totalPrice: newTotalItemPrice,
							totalDiscount: totalDiscountCartItem,
							quantity: sameItem.get("quantity") + 1,
						});
					} else {
						// Creating resource
						let addedTotalCartItemPrice = 0,
							totalDiscountCartItem = 0;

						addedTotalCartItemPrice = skuItem.product.price * data.quantity;

						totalDiscountCartItem =
							(skuItem.product.price - (skuItem.product.discountedPrice || skuItem.product.price)) * data.quantity;

						await CartItem.create(
							{
								quantity: data.quantity,
								skuId: data.skuId,
								totalPrice: addedTotalCartItemPrice,
								totalDiscount: totalDiscountCartItem,
								cartId: cart.get("id"),
							},
							{ transaction }
						);
					}
				}
			} else if (data.productId) {
				console.log("data . product is here");
				if (!data.colorId || !data.sizeId) {
					throw instance.httpErrors.badRequest("please provide color and size");
				}

				const customAttributeService = CustomAttributesService(instance);
				const color = await customAttributeService.getColorById(data.colorId);
				const size = await customAttributeService.getSizeById(data.sizeId);
				const productService = ProductService(instance);
				product = await productService.getOneProduct(data.productId);
				let length: CustomAttributes | null = null;
				if (data.lengthId) {
					length = await customAttributeService.getLengthById(data.lengthId);
				}

				const sameItem = cart.get("items").find((item) => item.get("productId") === data.productId);
				console.log("is same item", sameItem);
				if (sameItem) {
					// then we increase the item count in our cart by 1 and return
					let newTotalItemPrice = (sameItem.get("product").get("price") * data.quantity || 0) + sameItem.get("totalPrice");
					let totalDiscountCartItem =
						(sameItem.get("product").get("discountedPrice") * data.quantity || 0) + sameItem.get("totalDiscount");
					await sameItem.update({
						totalPrice: newTotalItemPrice,
						totalDiscount: totalDiscountCartItem,
						quantity: sameItem.get("quantity") + 1,
					});
				} else {
					// Creating resource
					let addedTotalCartItemPrice = 0,
						totalDiscountCartItem = 0;

					addedTotalCartItemPrice = product.price * data.quantity;
					totalDiscountCartItem = (product.price - (product.discountedPrice || product.price)) * data.quantity;
					console.log("creating here");
					await CartItem.create(
						{
							quantity: data.quantity,
							lengthId,
							colorId,
							sizeId,
							productId: data.productId,
							totalPrice: addedTotalCartItemPrice,
							totalDiscount: totalDiscountCartItem,
							cartId: cart.get("id"),
						},
						{ transaction }
					);
				}
			}

			// Validation (if needed) for different vendors items
			{
				// If we don't need to remove different vendors items, then we need to validate
				if (!removeDiffVendorItems) {
					const sameVendorItems = privateMethods.addItemSingleVendorValidation({
						cart,
						newSkuItem: skuItem,
						product,
					});
					if (!sameVendorItems) throw instance.httpErrors.notAcceptable("cart.response.cart.response.itemsMoreThanVendor");
				} else {
					// Here we will remove items of different vendors automatically without throwing error
					console.log("removing");
					await privateMethods.destroyProductsRelatedToDifferentVendor({
						vendorId: skuItem?.product?.vendorId || product?.vendorId || 0,
						transaction,
					});
				}
			}
			await cart.reload({ transaction });
			const grossTotal = cart.get("subTotal") + cart.get("deliveryCost");
			const finalPrice = grossTotal - cart.get("totalDiscount");
			await cart.update(
				{
					grossTotal,
					finalPrice,
				},
				{ transaction }
			);
			cart = await service.findOrCreateForUser({
				userId: data.userId,
				fullInfo: true,
				transaction,
			});

			return cartResponse({ cart, langCode, multiLang: false });
		},

		editCart: async (transaction: Transaction, dto: RequestData<IEditCartDto>) => {
			const { data, langCode } = dto;
			const userId = data.userId;
			let cart = await service.findOrCreateForUser({ userId, transaction });

			if (data.userAddressId) {
				const userAddressService = UserAddressService(instance);
				const userAddress = await userAddressService.findByPk({
					id: data.userAddressId,
				});

				// Checking that the address belongs to the user
				instance.authorizeUserResource(userAddress, userId);
				cart.userAddressId = data.userAddressId;
				const globalConfigsService = ConfigurationService(instance);
				const globalConfigs = await globalConfigsService.find();

				cart.deliveryCost = globalConfigs["deliveryPricing"][userAddress.get("insideDoha") ? "insideDoha" : "outsideDoha"];
				await cart.save({ transaction });
			}

			// Validating the updated cart items before doing updating
			await service.validateCart({
				cart: data,
				cartId: cart.get("id"),
				userId,
				transaction,
			});

			// Updating the old items
			await Promise.all(
				data.items.map(async (item) => {
					// already validated if exists above
					const cartItem = (await CartItem.findByPk(item.id, {
						include: cartItemIncludes,
					})) as CartItem;

					let totalCartItemPrice = (cartItem.sku?.product.price || cartItem.product?.price || 0) * item.quantity;
					let totalDiscountCartItem =
						((cartItem.sku?.product.price || cartItem.product?.price || 0) -
							(cartItem.product?.discountedPrice ||
								cartItem.sku?.product.discountedPrice ||
								cartItem.sku?.product.price ||
								cartItem.product?.price)) *
						item.quantity;

					await cartItem.update(
						{
							quantity: item.quantity,
							totalPrice: totalCartItemPrice,
							totalDiscount: totalDiscountCartItem,
						},
						{ transaction }
					);
				})
			);
			const grossTotal = cart.get("subTotal") + cart.get("deliveryCost");
			const finalPrice = grossTotal - cart.get("totalDiscount");
			await cart.update(
				{
					grossTotal,
					finalPrice,
				},
				{ transaction }
			);
			cart = await service.findOrCreateForUser({
				userId,
				fullInfo: true,
				transaction,
			});

			return cartResponse({ cart, langCode, multiLang: false });
		},

		removeItemFromCart: async (transaction: Transaction, dto: RequestData<IRemoveItemFromCartDto>) => {
			const { data, langCode } = dto;
			let cart = await service.findOrCreateForUser({
				userId: data.userId,
				transaction,
			});

			// Checking if removed item already exist and it belongs to users cart
			const cartItem = await CartItem.findOne({
				where: { id: data.itemId },
				include: [{ model: SKU }],
				transaction,
			});

			if (!cartItem) throw instance.httpErrors.notFound("cartItem.response.notFound");

			if (cartItem.get("cartId") !== cart.get("id")) throw instance.httpErrors.forbidden("common.response.notAllowedResource");

			await cartItem.destroy({ transaction });
			const grossTotal = cart.get("subTotal") + cart.get("deliveryCost");
			const finalPrice = grossTotal - cart.get("totalDiscount");
			await cart.update(
				{
					grossTotal,
					finalPrice,
				},
				{ transaction }
			);
			cart = await service.findOrCreateForUser({
				userId: data.userId,
				fullInfo: true,
				transaction,
			});

			return cartResponse({ cart, langCode, multiLang: false });
		},

		checkAndValidateCart: async (dto: RequestData<IValidateCartDto>) => {
			const { data, langCode } = dto;
			const cart = await service.findOrCreateForUser({
				userId: data.userId,
				fullInfo: true,
			});
			if (!cart.userAddress) {
				throw instance.httpErrors.badRequest("cart.response.userAddressShouldBeProvided");
			} else {
				const globalConfigService = ConfigurationService(instance);
				const globalConfig = await globalConfigService.find();
				const { price } = await service.calcDeliverFee(cart, globalConfig);
				cart.deliveryCost = price;
				await cart.save();
			}

			await service.validateCart({
				cart: {
					userId: data.userId,
					items: cart.items.map((item) => ({
						id: item.get("id"),
						quantity: item.get("quantity"),
					})),
				},
				cartId: cart.get("id"),
				userId: data.userId,
			});
			return {
				message: translateMessage("cart.response.validatedSuccessfully", langCode),
			};
		},
		calcDeliverFee: async (cart: Cart, globalConfig: Configuration) => {
			return { price: globalConfig.deliveryPricing.insideDoha };
			const vendor = cart.get("items")[0]?.sku?.product?.vendor || cart.get("items")[0]?.product?.vendor;
			const baseURL = "https://api.pass.qa/business";
			const options = {
				method: "POST",
				url: baseURL + "/v1/orders/price/calc",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer  ${instance.configs.delivery.key}`,
					"Content-Type": "application/json",
				},
				data: {
					pickup: {
						lat: vendor.address.latitude.toString(),
						long: vendor.address.longitude.toString(),
					},
					dropoffs: [
						{
							lat: cart.userAddress.lat,
							long: cart.userAddress.lng,
						},
					],
				},
			};
			try {
				const response = await axios(options);
				console.log({
					response,
				});
				const price = response.data.data.price;
				return { price };
			} catch (error: any) {
				console.log({
					data: error.response.data.data,
					error: error.response.data.data.errors,
				});
				throw instance.httpErrors.badRequest(error.response.data.data);
			}
		},
	};
	return service;
};
export default CartsService;
