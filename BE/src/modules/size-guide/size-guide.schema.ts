import { Type } from "@sinclair/typebox";
import { LangObjectType } from "src/types/common-types";
import { headersSchema } from "src/utils/json-schema";

const sizeMeasurementsSchema = Type.Object({
	sizeName: LangObjectType,
	bodyParts: Type.Array(
		Type.Object({
			name: LangObjectType,
			measurements: Type.Object({ cm: Type.Number(), inch: Type.Number() }),
		})
	),
});
export const sizeGuidesSchema = Type.Array(sizeMeasurementsSchema);

export const getSizeGuide = {
	description: "Get sizeGuide",
	security: [{ adminToken: [] }],
	headers: Type.Ref(headersSchema),
	tags: ["SizeGuides"],
	// response: {
	// 200: sizeGuidesSchema,
	// },
};

export const EditSizeGuides = {
	description: "Edit sizeGuide",
	tags: ["SizeGuides"],
	security: [{ adminToken: [] }],
	body: Type.Object({
		sizeGuide: sizeGuidesSchema,
		description: Type.Optional(LangObjectType),
	}),
	// response: {
	// 200: sizeGuidesSchema,
	// },
};
