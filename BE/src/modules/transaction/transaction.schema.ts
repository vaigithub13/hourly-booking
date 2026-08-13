import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";

export const TransactionResponse = Type.Object({
	id: Type.Optional(Type.Number()),
	amount: Type.Optional(Type.Number()),
	description: Type.Optional(
		Type.Object({
			en: Type.String(),
			ar: Type.String(),
		})
	),
	date: Type.Optional(Type.String()),
	type: Type.Optional(Type.Number()),
	vendor: Type.Optional(Type.Any()),
	attachment: Type.Optional(Type.String()),
});

export const createTransaction = {
	description: "create or update transaction { admin token } ",
	tags: ["Transaction"],
	headers: Type.Ref(headersSchema),
	security: [
		{
			userToken: [],
		},
	],
	body: Type.Object({
		vendorId: Type.Number(),
		orderId: Type.Number(),
		date: Type.String({ description: "iso string" }),
		description: Type.Object({
			en: Type.String(),
			ar: Type.String(),
		}),
		type: Type.Number({ description: " 0  for in  and  1 for out", minimum: 0, maximum: 1 }),
		attachment: Type.Optional(Type.String()),
	}),
};

export const deleteById = {
	description: "delete transaction by id  { admin token } ",
	tags: ["Transaction"],
	headers: Type.Ref(headersSchema),
	security: [
		{
			userToken: [],
		},
	],
	params: Type.Object({
		id: Type.Number(),
	}),
};
export const updateTransactionAttachment = {
	description: "update transaction attachment by admin",
	tags: ["Transaction"],
	headers: Type.Ref(headersSchema),
	security: [
		{
			userToken: [],
		},
	],
	body: Type.Object({
		id: Type.Number({ description: "transaction id" }),
		attachment: Type.String(),
	}),
	// response: {
	// 	200: Type.Object({
	// 		message: Type.String(),
	// 	}),
	// },
};

export const userTransactions = {
	description: "get user transactions { user token } ",
	tags: ["Transaction"],
	headers: Type.Ref(headersSchema),
	security: [
		{
			userToken: [],
		},
	],
	querystring: Type.Object({
		limit: Type.Number(),
		offset: Type.Number(),
		vendorId: Type.Number(),
		isSortAsc: Type.Optional(Type.Boolean({ description: "" })),
		isSortDesc: Type.Optional(Type.Boolean({ description: "" })),
	}),
	// response: {
	// 	200: Type.Object({
	// 		count: Type.Number(),
	// 		rows: Type.Array(TransactionResponse),
	// 	}),
	// },
};
