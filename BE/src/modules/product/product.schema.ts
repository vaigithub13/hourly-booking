import { SortDirectionEnum } from "./../../utils/json-schema/index";
import { headersSchema, Nullable, TwoLangs, TwoLangsOrOne } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { vendorAdminSchema } from "../admin/admin.schema";
import { LangObjectType } from "src/types/common-types";
import { ProductSortOptions } from "./product.dto";

const categorySchema = Type.Object({
	id: Type.Number(),
	name: TwoLangsOrOne,
	image: Type.Optional(Type.String()),
	isRequiredLength: Type.Optional(Type.Boolean()),
});

const customAttributes = Nullable(
	Type.Object({
		id: Type.Number(),
		type: Type.String(),
		name: TwoLangsOrOne,
	})
);

export const skuData = Type.Object({
	id: Type.Number(),
	size: Nullable(customAttributes),
	color: Nullable(customAttributes),
	length: Nullable(customAttributes),
	amount: Type.Number(),
	code: Type.String(),
	product: Type.Optional(
		Type.Object({
			id: Type.Number(),
			name: TwoLangsOrOne,
			description: TwoLangsOrOne,
			price: Type.Number(),
			discountedPrice: Type.Optional(Type.Number()),
			approved: Type.Optional(Type.Boolean()),
			mainImage: Type.String(),
			images: Type.Array(Type.String()),
			categories: Type.Optional(Type.Array(categorySchema)),
			// category,
			serial: Type.String(),
			vendor: Type.Optional(vendorAdminSchema),
		})
	),
});

const basicProductData = Type.Object({
	id: Type.Number(),
	name: TwoLangsOrOne,
	description: TwoLangsOrOne,
	price: Type.Number(),
	isRequiredLength: Type.Optional(Type.Boolean()),
	discountedPrice: Type.Optional(Type.Number()),
	etaDays: Type.Number(),
	mainImage: Type.String(),
	images: Type.Array(Type.String()),
	readyToShip: Type.Boolean(),
	approved: Type.Boolean(),
	categories: Type.Optional(Type.Array(categorySchema)),
	// category,
	serial: Type.String(),
	skus: Type.Optional(Type.Array(skuData)),
	supportedCustomAttributes: Type.Optional(Type.Array(Type.Any())),
	vendor: Type.Optional(vendorAdminSchema),
});

const productData = Type.Object({
	id: Type.Number(),
	name: TwoLangsOrOne,
	description: TwoLangsOrOne,
	isRequiredLength: Type.Optional(Type.Boolean()),
	serial: Type.String(),
	price: Type.Number(),
	discountedPrice: Type.Optional(Type.Number()),
	etaDays: Type.Number(),
	mainImage: Type.String(),
	readyToShip: Type.Boolean(),
	approved: Type.Boolean(),
	images: Type.Array(Type.String()),
	totalOrders: Type.Optional(Type.Number()),
	categories: Type.Optional(Type.Array(categorySchema)),
	metadata: Type.Optional(Type.Any()),
	// category,
	vendor: Type.Optional(vendorAdminSchema),
	skus: Type.Optional(Type.Array(skuData)),
	supportedCustomAttributes: Type.Optional(Type.Any()),
});

const sizeAndColor = Type.Object({
	colorId: Type.Number(),
	sizeId: Type.Number(),
	lengthId: Type.Optional(Type.Number()),
	amount: Type.Number(),
	// serial: Type.Number(),
});

export const getProducts = {
	description: "get all products  {} ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	querystring: Type.Object({
		limit: Type.Number({ default: 10, minimum: 0 }),
		offset: Type.Number({ default: 0, minimum: 0 }),
		vendorId: Type.Optional(Type.Number()),
		minPrice: Type.Optional(Type.Number()),
		maxPrice: Type.Optional(Type.Number()),
		name: Type.Optional(Type.String()),
		approved: Type.Optional(Type.Boolean()),
		readyToShip: Type.Optional(Type.Boolean()),
		categoriesIds: Type.Optional(Type.Array(Type.Integer())),
		rate: Type.Optional(Type.Number()),
		// categoryId: Type.Optional(Type.Number()),
		sortBy: Type.Optional(Type.Enum(ProductSortOptions)),
		sort: Type.Optional(Type.Optional(Type.Enum(SortDirectionEnum))),
		sku: Type.Optional(Type.String()),
		serial: Type.Optional(Type.String()),
		metadata: Type.Optional(Type.Any()),
		isDiscounted: Type.Boolean({ default: false }),
	}),
	security: [{ userToken: [], adminToken: [] }],
	response: {
		200: {
			count: Type.Number(),
			products: Type.Array(basicProductData),
		},
	},
};

export const getProductsForVendor = {
	description: "get all products  {} ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	querystring: Type.Object({
		limit: Type.Number({ default: 10, minimum: 0 }),
		offset: Type.Number({ default: 0, minimum: 0 }),
		name: Type.Optional(Type.String()),
		vendorId: Type.Optional(Type.Number()),
		readyToShip: Type.Optional(Type.Boolean()),
		categoriesIds: Type.Optional(Type.Array(Type.Integer())),
		// categoryId: Type.Optional(Type.Number()),
		approved: Type.Optional(Type.Boolean()),
		sku: Type.Optional(Type.String()),
		serial: Type.Optional(Type.String()),
		isDiscounted: Type.Boolean({ default: false }),
	}),
	security: [{ adminToken: [] }],
	response: {
		200: {
			count: Type.Number(),
			products: Type.Array(basicProductData),
		},
	},
};

export const getProductbyId = {
	description: "get product by id ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ userToken: [], adminToken: [] }],
	params: Type.Object({
		productId: Type.Number(),
	}),
	response: {
		200: productData,
	},
};
export const getMetadata = {
	description: "get metadata ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ userToken: [], adminToken: [] }],
};

export const newProduct = {
	description: "new product ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ userToken: [], adminToken: [] }],
	body: Type.Object({
		name: TwoLangs,
		description: TwoLangs,
		price: Type.Number(),
		vendorId: Type.Optional(Type.Number()),
		mainImage: Type.String(),
		discountedPrice: Type.Optional(Type.Number()),
		readyToShip: Type.Boolean({ default: false }),
		etaDays: Type.Number(),
		serial: Type.String(),
		images: Type.Array(Type.String()),
		categoriesIds: Type.Array(Type.Integer()),
		sizesAndColors: Type.Array(sizeAndColor, { minItems: 0 }),
		supportedCustomAttributes: Type.Optional(Type.Array(Type.Number(), { minItems: 0, default: [] })),
		metadata: Type.Optional(
			Type.Object({
				type: Type.Optional(Type.String()),
				fabric: Type.Optional(Type.String()),
				washingInstructions: Type.Optional(Type.String()),
				ironingInstructions: Type.Optional(Type.String()),
				includesHijab: Type.Optional(Type.Boolean()),
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
			})
		),
	}),
	response: {
		200: {
			message: Type.String(),
		},
	},
};
export const seed = {
	tags: ["Products"],
	headers: Type.Ref(headersSchema),
};
export const editProduct = {
	description: "edit product ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ userToken: [], adminToken: [] }],
	body: Type.Object({
		name: TwoLangs,
		description: TwoLangs,
		price: Type.Number(),
		mainImage: Type.String(),
		etaDays: Type.Number(),
		serial: Type.String(),
		images: Type.Array(Type.String()),
		readyToShip: Type.Boolean(),
		categoriesIds: Type.Array(Type.Integer()),
		// category: Type.Number(),
		discountedPrice: Type.Optional(Type.Number({ minimum: 0 })),
		productId: Type.Number(),
		sizesAndColors: Type.Array(sizeAndColor, { minItems: 0 }),
		supportedCustomAttributes: Type.Optional(Type.Array(Type.Number(), { minItems: 0, default: [] })),
		metadata: Type.Optional(
			Type.Object({
				type: Type.Optional(Type.String()),
				fabric: Type.Optional(Type.String()),
				washingInstructions: Type.Optional(Type.String()),
				ironingInstructions: Type.Optional(Type.String()),
				includesHijab: Type.Optional(Type.Boolean()),
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
			})
		),
	}),
	response: {
		200: productData,
	},
};

export const deleteProduct = {
	description: "delete product ",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		productId: Type.Number(),
	}),
	response: {
		200: {
			message: Type.String(),
		},
	},
};

export const approveProduct = {
	description: "Admin approve product",
	headers: Type.Ref(headersSchema),
	tags: ["Products"],
	security: [{ adminToken: [] }],
	params: Type.Object({
		productId: Type.Number(),
	}),
	response: {
		200: productData,
	},
};
