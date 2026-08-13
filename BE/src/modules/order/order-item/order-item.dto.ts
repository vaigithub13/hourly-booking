import { Product, SKU } from "src/modules/product/product.model";
import { OrderItem } from "./order-item.model";
import { IProductDataResponse, IProductResponse, ISKUResponse, ProductResponse, SKUResponse } from "src/modules/product/product.dto";
import { customAttributesResponse, CustomAttributesResponse } from "src/modules/custom_attributes/custom_attributes.dto";

export interface IOrderItemResponse {
	id: number;
	totalPrice: number;
	quantity: number;

	orderId: number;
	sku: ISKUResponse | null;
  product: IProductResponse | null;
  length?: customAttributesResponse | null;
  size?: customAttributesResponse | null;
  color?: customAttributesResponse | null;
}

export const orderItemResponse = (data: { orderItem: OrderItem; langCode: string; multiLang?: boolean }) => {
	const { orderItem, langCode, multiLang } = data;
	const { id, totalPrice, quantity, orderId, skuData, productData, length, size, color } = orderItem;
	const response: IOrderItemResponse = {
		id,
		totalPrice,
		quantity,
		orderId,
		sku: skuData ? SKUResponse(skuData as SKU, langCode, multiLang) : null,
		product: productData ? ProductResponse(productData as Product, langCode, multiLang) : null,
		length: length ? CustomAttributesResponse(length, langCode, multiLang) : null,
		color: color ? CustomAttributesResponse(color, langCode, multiLang) : null,
		size: size ? CustomAttributesResponse(size, langCode, multiLang) : null,
	};
	return response;
};
