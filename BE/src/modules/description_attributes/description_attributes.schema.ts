import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "../../utils/json-schema";
import { AttributeEnum } from "src/types/enums";

export const CustomAttributesDto = Type.Object({
	id: Type.Optional(Type.Number()),
	type: Type.Enum(AttributeEnum),
	name: Type.Optional(
		Type.Union([
			Type.Object({
				en: Type.String(),
				ar: Type.String(),
			}),
			Type.String(),
		])
	),
});

export const CustomAttributesResponse = Type.Object({
	count: Type.Number(),
	rows: Type.Array(CustomAttributesDto),
});

export const getCustomAttributes = {
	description: "get all CustomAttributes  {} ",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["CustomAttributes"],
	querystring: Type.Object({
		type: Type.Optional(Type.Enum(AttributeEnum)),
	}),
	response: {
		200: {
			count: Type.Number(),
			rows: Type.Array(CustomAttributesDto),
		},
	},
};

export const createCustomAttributes = {
	description: "create CustomAttributes  { admin token } ",
	headers: Type.Ref(headersSchema),
	tags: ["CustomAttributes"],
	security: [{ adminToken: [] }],
	body: Type.Object({
		type: Type.Enum(AttributeEnum),
		name: Type.Object({
			en: Type.String(),
			ar: Type.String(),
		}),
	}),
	// response: {
	//     200: CustomAttributesDto,
	// },
};

export const editCustomAttributes = {
	description: "edit CustomAttributes { admin token } ",
	headers: Type.Ref(headersSchema),
	tags: ["CustomAttributes"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		id: Type.Number(),
	}),
	body: Type.Object({
		name: Type.Object({
			en: Type.String(),
			ar: Type.String(),
		})
	}),
	response: {
		200: CustomAttributesDto,
	},
};

export const removeCustomAttributes = {
	description: "remove CustomAttributes { admin token } ",
	headers: Type.Ref(headersSchema),
	tags: ["CustomAttributes"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		id: Type.Number(),
	}),
	response: {
		200: {
			result: Type.Boolean(),
		},
	},
};
