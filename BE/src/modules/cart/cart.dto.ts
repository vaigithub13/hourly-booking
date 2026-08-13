import { customAttributesResponse } from "./../custom_attributes/custom_attributes.dto";
import { CustomAttributesResponse } from "./../description_attributes/description_attributes.dto";
import { ProductLength } from "../product-length/product-length.model";
import { ISKUResponse, ProductResponse, SKUResponse } from "../product/product.dto";
import { IUserAddressResponse, userAddressResponse } from "../user-address/user-address.dto";
import { IUserResponse, userResponse } from "../user/user.dto";
import { Cart, CartItem } from "./cart.model";

export interface ICartItemResponse {
	id: number;
	totalPrice: number;
	totalDiscount: number;
	length?: customAttributesResponse | null;
	size?: customAttributesResponse | null;
	color?: customAttributesResponse | null;
	quantity: number;
	sku: ISKUResponse;
}

export interface IValidateCartDto {
	userId: number; // This should be provided in the controller
}

export interface IAddItemToCartDto {
	userId: number; // This should be provided in the controller
	skuId?: number;
	removeDiffVendorItems?: boolean;
	quantity: number;
	lengthId?: number;
	colorId?: number;
	sizeId?: number;
	productId?: number;
}

export interface IEditCartDto {
	userId: number; // This should be provided in the controller
	items: { id: number; quantity: number }[];
	userAddressId?: number;
}

export interface IRemoveItemFromCartDto {
	userId: number; // This should be provided in the controller
	itemId: number;
}

export interface ICartResponse {
	id: number;
	grossTotal: number;
	subTotal: number;
	deliveryCost: number;
	finalPrice: number;
	totalDiscount: number;
	userAddressId?: number;
	userAddress?: IUserAddressResponse;
	user?: IUserResponse;
	items: ICartItemResponse[];
}

export const cartResponse = (data: { cart: Cart; langCode: string; multiLang?: boolean }) => {
	const { cart, multiLang, langCode } = data;
	const { id, user, items, totalDiscount, subTotal, userAddressId, grossTotal, deliveryCost, userAddress, finalPrice } = cart;
	const response: ICartResponse = {
		id,
		subTotal,
		totalDiscount,
		grossTotal,
		userAddressId,
		deliveryCost,
		finalPrice,
		userAddress: userAddress ? userAddressResponse(userAddress) : undefined,
		user: user ? userResponse(user, langCode) : undefined,
		items: items.map((item: CartItem) => cartItemResponse({ item, langCode, multiLang })),
	};
	return response;
};

const cartItemResponse = (data: { item: CartItem; langCode: string; multiLang?: boolean }) => {
	const { item, langCode, multiLang } = data;
	const { id, totalPrice, quantity, product, sku, totalDiscount, size, color, length } = item;
	const response: ICartItemResponse = {
		id,
		totalPrice,
		product: product ? ProductResponse(product, langCode, multiLang) : null,
		length: length ? CustomAttributesResponse(length, langCode, multiLang) : null,
		size: size ? CustomAttributesResponse(size, langCode, multiLang) : null,
		color: color ? CustomAttributesResponse(color, langCode, multiLang) : null,
		totalDiscount,
		quantity,
		sku: sku ? SKUResponse(sku, langCode, multiLang) : null,
	};
	return response;
};
