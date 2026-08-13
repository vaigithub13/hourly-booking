import { Type } from "@sinclair/typebox";
import { userSchema } from "../user/user.schema";
import { skuData } from "../product/product.schema";
import { deviceSchema } from "src/utils/json-schema";
import { idParamObject, responseMessage } from "src/types/common-types";
import userAddress from "../user-address";
import { userAddressSchema } from "../user-address/user-address.schema";

const cartItemSchema = Type.Object({
	id: Type.Integer({ minimum: 1 }),
	totalPrice: Type.Number(),
	totalDiscount: Type.Number(),
	quantity: Type.Integer({ minimum: 1 }),
	length: Type.Optional(Type.Any()),
	sku: Type.Optional(skuData),
});

const cartSchema = Type.Object({
	id: Type.Integer({ minimum: 1 }),
	grossTotal: Type.Number(),
	subTotal: Type.Number(),
	deliveryCost: Type.Number(),
	userAddressId: Type.Optional(Type.Integer()),
	finalPrice: Type.Number(),
	totalDiscount: Type.Number(),
	userAddress: Type.Optional(userAddressSchema),
	user: Type.Optional(userSchema),
	items: Type.Array(Type.Any()),
});

export const getUserCart = {
	description: "Get my cart (for user)",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	response: {
		200: cartSchema,
	},
};

export const addCartItem = {
	description: "Add new item to the cart",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	body: Type.Object({
		skuId: Type.Optional(Type.Integer({ minimum: 1 })),
		productId: Type.Optional(Type.Integer({ minimum: 1 })),
		colorId: Type.Optional(Type.Integer({ minimum: 1 })),
		sizeId: Type.Optional(Type.Integer({ minimum: 1 })),
		lengthId: Type.Optional(Type.Integer({ minimum: 1 })),
		removeDiffVendorItems: Type.Optional(Type.Boolean({ default: false })),
		quantity: Type.Integer({ minimum: 1 }),
	}),
	response: {
		201: cartSchema,
	},
};

export const validateCart = {
	description: "Validate Cart",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	response: {
		201: responseMessage,
	},
};

export const editCart = {
	description: "Edit cart existing items (change attributes of currently existing items NOTE that you cannot add or remove new items)",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	body: Type.Object({
		userAddressId: Type.Optional(Type.Integer({ minimum: 1 })),
		items: Type.Array(
			Type.Object({
				skuId: Type.Optional(Type.Integer({ minimum: 1 })),
				productId: Type.Optional(Type.Integer({ minimum: 1 })),
				quantity: Type.Integer({ minimum: 1 }),
			})
		),
	}),
	response: {
		200: cartSchema,
	},
};

export const removeItemFromCart = {
	description: "Remove existing item from the cart",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	body: Type.Object({
		itemId: Type.Integer({ minimum: 1 }),
	}),
	response: {
		200: cartSchema,
	},
};

export const clearMyCart = {
	description: "Clear user cart (by providing token)",
	headers: Type.Ref(deviceSchema),
	tags: ["Cart"],
	security: [{ userToken: [] }],
	response: {
		200: responseMessage,
	},
};
