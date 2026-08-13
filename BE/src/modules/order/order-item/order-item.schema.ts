import { Type } from "@sinclair/typebox";
import { skuData } from "src/modules/product/product.schema";

export const orderItemSchema = Type.Object({
	id: Type.Number(),
	totalPrice: Type.Number(),
	quantity: Type.Number(),
	orderId: Type.Number(),
	sku: Type.Optional(Type.Union([skuData, Type.Null()])),
	product: Type.Optional(Type.Any()),
	length: Type.Optional(Type.Any()),
	color: Type.Optional(Type.Any()),
	size: Type.Optional(Type.Any()),
});
