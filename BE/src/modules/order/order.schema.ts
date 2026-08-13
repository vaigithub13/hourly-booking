import { Type } from "@sinclair/typebox";
import { PaginatedSchema, PaginationQuerySchema, StringEnum, deviceSchema, headersSchema } from "src/utils/json-schema";
import { OrderStatusEnum } from "./order.dto";
import { Locationschema } from "../locations/locations.schema";
import { userSchema } from "../user/user.schema";
import { vendorAdminSchema } from "../admin/admin.schema";
import { orderItemSchema } from "./order-item/order-item.schema";
import { idParamObject, responseMessage } from "src/types/common-types";
import { userAddressSchema } from "../user-address/user-address.schema";
import { RefundTargetEnum } from "./cancel-order.dto";

export const orderSchema = Type.Object({
	id: Type.Integer(),
	subTotal: Type.Number(),
	grossTotal: Type.Number(),
	walletPaidAmount: Type.Number(),
	status: Type.String(),
	statusId: Type.Integer(),
	deliveryCost: Type.Number(),
	totalDiscount: Type.Number(),
	isPaid: Type.Optional(Type.Boolean()),
	totalItemsQuantity: Type.Optional(Type.Integer()),
	finalPrice: Type.Number(),
	finalPriceWithoutReturned: Type.Optional(Type.Number()),
	estimatedDeliveryDays: Type.Number(),
	canBeCanceled: Type.Boolean(),
	canBeReturned: Type.Boolean(),
	paymentMethod: Type.Optional(Type.String()),
	paymentStatus: Type.Optional(Type.String()),
	rate: Type.Optional(Type.Number()),
	itemsCount: Type.Optional(Type.Integer()),
	returnOrderId: Type.Optional(Type.Number()),
	location: Locationschema,
	userAddress: Type.Optional(userAddressSchema),
	user: Type.Optional(userSchema),
	vendor: Type.Optional(vendorAdminSchema),
	deliveryId: Type.Optional(Type.Any()),
	taskId: Type.Optional(Type.Any()),
	note: Type.Optional(Type.String()),
	createdAt: Type.Optional(Type.String()),
	items: Type.Optional(Type.Array(orderItemSchema)),
	accounting: Type.Optional(Type.Any())
});

export const cancelOrderRequestSchema = Type.Object({
	id: Type.Integer(),
	status: Type.String(),
	refundTarget: Type.String(),
	user: Type.Optional(userSchema),
	vendor: Type.Optional(vendorAdminSchema),
	order: Type.Optional(orderSchema),
});

export const createOrder = {
	description: "Create order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [] }],
	body: Type.Object({
		payWithWallet: Type.Boolean({ default: false }),
		locationId: Type.Integer(),
		userAddressId: Type.Integer(),
		note: Type.Optional(Type.String()),
	}),
	response: {
		201: orderSchema,
	},
};

export const placeOrder = {
	description: "Place order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [] }],
	body: Type.Object({
		payWithWallet: Type.Boolean({ default: false }),
		locationId: Type.Integer(),
		note: Type.Optional(Type.String()),
	}),
};

export const updateOrderStatusWebhook = {
	description: "update order status webhook",
	tags: ["Order"],
	body: Type.Object({
		task_id: Type.String(),
		status: Type.String(),
	}),
};

export const trackOrder = {
	description: "update order status  { vendor token } ",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [
		{
			userToken: [],
		},
	],
	params: Type.Object({
		id: Type.Number(),
	}),
	response: {
		200: Type.Object({
			data: Type.String(),
		}),
	},
};

export const updateOrderStatus = {
	description: "Update order status by admin",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [{ adminToken: [] }],
	body: Type.Object({
		newStatus: StringEnum(Object.values(OrderStatusEnum)),
	}),
	params: idParamObject,
	response: {
		201: orderSchema,
	},
};
export const revertPickupStatus = {
	description: "Rvert order status by admin",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [{ adminToken: [] }],
	params: idParamObject,
};

export const getOrders = {
	description: "get orders",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	querystring: Type.Object({
		...PaginationQuerySchema,
		status: Type.Optional(StringEnum(Object.values(OrderStatusEnum))),
		vendorId: Type.Optional(Type.Integer()),
		userId: Type.Optional(Type.Integer()),
		locationId: Type.Optional(Type.Integer()),
		isPaid: Type.Optional(Type.Boolean()),
	}),
	response: {
		200: PaginatedSchema(orderSchema),
	},
};

export const getOneOrder = {
	description: "Get one order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	params: idParamObject,
	response: {
		200: orderSchema,
	},
};

export const getOneReturnOrder = {
	description: "Get one order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	params: idParamObject,
	// response: {
	// 200: Type.Any(),
	// },
};

export const approveReturnOrder = {
	description: "Get one order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	params: idParamObject,
	body: Type.Object({
		deliveryPaidByVendor: Type.Boolean(),
	}),
	// response: {
	// 200: Type.Any(),
	// },
};

export const addReturnReasonsForVendor = {
	description: "Add Return Reasons for vendor",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	params: idParamObject,
	body: Type.Object({
		vendorReason: Type.String(),
		vendorImages: Type.Optional(Type.Array(Type.String())),
	}),
	// response: {
	// 200: Type.Any(),
	// },
};

export const CompleteReturnOrder = {
	description: "Get one order",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	params: idParamObject,
	body: Type.Object({
		refundTarget: StringEnum(Object.values(RefundTargetEnum)),
		amount: Type.Optional(Type.Number()),
	}),
	// response: {
	// 200: Type.Any(),
	// },
};

//* Cancel Orders Requests Schemas

export const setRefundTarget = {
	description: "Through this endpoint, admin decide to where should the refunded money go (wallet or original payment)",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ adminToken: [] }],
	body: Type.Object({
		refundTarget: StringEnum(Object.values(RefundTargetEnum)),
		walletRefundValue: Type.Optional(Type.Number()),
	}),
	params: Type.Object({ cancelRequestId: Type.Integer() }),
	response: {
		200: cancelOrderRequestSchema,
	},
};

export const createCancelOrderReq = {
	description: "Create cancel order request",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [] }],
	params: idParamObject,
	response: {
		200: cancelOrderRequestSchema,
	},
};

//* return Order Request Schema
export const returnOrder = {
	description: "Create return order request",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [] }],
	params: idParamObject,
	body: Type.Object({
		products: Type.Array(
			Type.Object({
				productId: Type.Optional(Type.Number()),
				skuId: Type.Optional(Type.Number()),
				quantity: Type.Number(),
			})
		),
		userAddressId: Type.Number(),
		returnReason: Type.Optional(Type.String()),
		images: Type.Optional(Type.Array(Type.String(), { default: [] })),
	}),
	// response: {
	//   200: Type.Any(),
	// },
};

export const getReturnOrdersRequests = {
	description: "Get all return orders requests (for admin and vendor).",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	querystring: Type.Object({
		...PaginationQuerySchema,
		userId: Type.Optional(Type.Integer()),
		vendorId: Type.Optional(Type.Integer()),
	}),
};
//* return Order Request Schema
export const rateOrder = {
	description: "Rate Order request",
	headers: Type.Ref(deviceSchema),
	tags: ["Order"],
	security: [{ userToken: [] }],
	params: idParamObject,
	body: Type.Object({
		rate: Type.Number({ minimum: 1, maximum: 5 }),
	}),
	response: {
		200: Type.Any(),
	},
};

export const getCancelOrdersRequests = {
	description: "Get all cancel orders requests (for admin and vendor).",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [{ userToken: [], adminToken: [] }],
	querystring: Type.Object({
		...PaginationQuerySchema,
		userId: Type.Optional(Type.Integer()),
		vendorId: Type.Optional(Type.Integer()),
	}),
	response: {
		200: PaginatedSchema(cancelOrderRequestSchema),
	},
};

export const approveCancelOrderReq = {
	description: "Approve Cancel Order Request",
	headers: Type.Ref(headersSchema),
	tags: ["Order"],
	security: [{ adminToken: [] }],
	params: idParamObject,
	response: {
		200: cancelOrderRequestSchema,
	},
};

export const orderMetaData = {
	description: "Order meta data (orders statuses, values of enums, ..etc).",
	tags: ["Order"],
	response: {
		200: Type.Object({
			orderStatusEnum: Type.Array(
				Type.Object({
					id: Type.Integer(),
					status: Type.String(),
				})
			),
			returnOrderStatusEnum: Type.Array(Type.String()),
			paymentStatusEnum: Type.Array(Type.String()),
			refundTargetEnum: Type.Array(Type.String()),
		}),
	},
};
