import { Type } from "@sinclair/typebox";
import { LangObjectType } from "src/types/common-types";
import { headersSchema } from "src/utils/json-schema";

export const getTips = {
	description: "Get Tips",
	security: [{ adminToken: [] }],
	headers: Type.Ref(headersSchema),
	tags: ["Tips"],
};

export const EditTips = {
	description: "Edit Tips",
	tags: ["Tips"],
	security: [{ adminToken: [] }],
	body: Type.Object({
		fabricCare: Type.Optional(
			Type.Array(
				Type.Object({
					key: LangObjectType,
					values: Type.Array(LangObjectType),
				})
			)
		),
		washingMethods: Type.Optional(
			Type.Array(
				Type.Object({
					key: LangObjectType,
					values: Type.Array(LangObjectType),
				})
			)
		),
	}),
	// response: {
	// 200: sizeGuidesSchema,
	// },
};
