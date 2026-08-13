import { Type } from "@sinclair/typebox";
import { headersSchema } from "src/utils/json-schema";
import { ReturnOrderRequestStatusEnum } from "../order/return-order.enum";
import { OrderStatusEnum } from "../order/order.dto";

export const getAdminSalesStatistics = {
	description: "Sales Overview Statistics",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		from: Type.String({ format: "date-time" }),
		to: Type.String({ format: "date-time" }),
	}),
	response: {
		200: Type.Any(),
	},
};

export const getTotalOrders = {
	description: "Total Order for vendor and admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		from: Type.Optional(Type.String({ format: "date-time" })),
		to: Type.Optional(Type.String({ format: "date-time" })),
		status: Type.Optional(Type.Enum(OrderStatusEnum)),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const getTotalReturnOrders = {
	description: "Total Return Order for vendor and admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		status: Type.Optional(Type.Enum(ReturnOrderRequestStatusEnum)),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const getTotalVendors = {
	description: "Total Vendors for admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const getTotalCustomers = {
	description: "Total Customers for admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const getTotalRevenue = {
	description: "Total Revenue for vendor",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		vendorId: Type.Optional(Type.Number()),
		from: Type.Optional(Type.String({ format: "date-time" })),
		to: Type.Optional(Type.String({ format: "date-time" })),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const getTotalEarning = {
	description: "Total Earning for vendor",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({}),
	// response: {
	// 	200: Type.Any(),
	// },
};

export const ordersStatisticsLineChart = {
	description: "Total Orders and return and cancel for vendor and admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		from: Type.Optional(Type.String({ format: "date-time" })),
		to: Type.Optional(Type.String({ format: "date-time" })),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};
export const usersStatisticsLineChart = {
	description: "Total Users and Vendors admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		from: Type.Optional(Type.String({ format: "date-time" })),
		to: Type.Optional(Type.String({ format: "date-time" })),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};
export const revenueStatisticsLineChart = {
	description: "Total Users and Vendors admin",
	headers: Type.Ref(headersSchema),
	tags: ["Statistics"],
	security: [{ adminToken: [] }],
	query: Type.Object({
		from: Type.Optional(Type.String({ format: "date-time" })),
		to: Type.Optional(Type.String({ format: "date-time" })),
	}),
	// response: {
	// 	200: Type.Any(),
	// },
};
