import { headersSchema, TwoLangs } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "../../utils/json-schema";
import { AccountingStatus } from "src/types/enums";
import { vendorSchema } from "../vendor/vendor.schema";
import { orderSchema } from "../order/order.schema";

const Accounting = Type.Object({
	id: Type.Number(),
	amount: Type.Number(),
	type: Type.Enum(AccountingStatus),
	createdAt: Type.String(),
	orderId: Type.Number(Type.Number()),
	returnOrderId: Type.Optional(Type.Number()),
	status: Type.Optional(Type.String()),
	vendor: vendorSchema,
	order: Type.Optional(orderSchema)
})

const AccountingFullData = Type.Object({
	id: Type.Number(),
	amount: Type.Number(),
	type: Type.Enum(AccountingStatus),
	createdAt: Type.String(),
	vendor: vendorSchema,
	order: Type.Optional(orderSchema),
	returnOrder: Type.Optional(Type.Any()),
})

export const getAllAccountings = {
	description: "get All Accountings ",
	headers: Type.Ref(headersSchema),
	tags: ["Accounting"],
	security: [{ adminToken: [] }],
	querystring: Type.Object({
		vendorId: Type.Optional(Type.Number()),
		createdAt: Type.Optional(Type.String()),
		status: Type.Optional(Type.Enum(AccountingStatus)),
		orderId: Type.Optional(Type.Number()),
		returnOrderId: Type.Optional(Type.Number()),
		limit: Type.Number({ default: 10, minimum: 0 }),
		offset: Type.Number({ default: 0, minimum: 0 }),
	}, { additionalProperties: false }),
	response: {
		200: {
			count: Type.Number(),
			accountings: Type.Array(Accounting),
		},
	},
};

export const getAccountingById = {
	description: "get Accountings by id",
	headers: Type.Ref(headersSchema),
	tags: ["Accounting"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		accountingId: Type.Number()
	}, { additionalProperties: false }),
};

export const vendorAccounting = {
	description: "vendorAccounting",
	headers: Type.Ref(headersSchema),
	tags: ["Accounting"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		vendorId: Type.Number()
	}, { additionalProperties: false }),
	querystring: Type.Object({
		limit: Type.Number({ default: 10, minimum: 0 }),
		offset: Type.Number({ default: 0, minimum: 0 }),
	}, { additionalProperties: false }),
	response: {
		200: {
			appPercentage: Type.Optional(Type.Number()),
			total_revenue: Type.Number(),
			// commissions: Type.Number(),
			vendor_share: Type.Number(),
			admin_revenue: Type.Number(),
			total_revenue_without_delivery_value : Type.Number(),
			paid: Type.Number(),
			due: Type.Number(),
			totalReturn: Type.Number(),
			accountingCount: Type.Number(),
			allAccountings: Type.Array(Type.Object({
				id: Type.Number(),
				amount: Type.Number(),
				orderId: Type.Number(),
				order_revenue: Type.Number(),
				deliveryCost : Type.Number(),
				status: Type.String(),
				type: Type.String(),
				date: Type.String(),
				returnedOrderId: Type.Number(),
				returnedOrderStatus: Type.String(),
				return_order_revenue: Type.Number(),
			})),
		},
	},
};

export const vendorAccountingForAll = {
	description: "vendorAccountingForAll",
	headers: Type.Ref(headersSchema),
	tags: ["Accounting"],
	security: [{ adminToken: [] }],
	querystring: Type.Object({
		name: Type.Optional(Type.String()),
		limit: Type.Number({ default: 10, minimum: 0 }),
		offset: Type.Number({ default: 0, minimum: 0 }),
	}, { additionalProperties: false }),
	response: {
		200: {
			count: Type.Number(),
			accountingData: Type.Array(
				Type.Object({
					id: Type.Number(),
					vendorName: TwoLangs,
					email: Type.String(),
					logo: Type.String(),
					ownerName: TwoLangs,
					total_revenue: Type.Number(),
					total_revenue_without_delivery_charge: Type.Number(),
					commissions: Type.Number(),
					total_return_commissions: Type.Number(),
					vendor_share: Type.Number(),
					admin_revenue: Type.Number(),
					paid: Type.Number(),
					due: Type.Number(),
					totalReturn: Type.Number()
				})
			)
			,
		},
	},
};
