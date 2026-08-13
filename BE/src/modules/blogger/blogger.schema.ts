import { LangObjectType, idParamObject, responseMessage } from "../../types/common-types";
import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";

const BloggerSchema = Type.Object({
	id: Type.Number(),
	name: Type.Union([Type.String(), LangObjectType]),
	logo: Type.String(),
	email: Type.String(),
});

export const getBloggers = {
	description: "Get all Bloggers",
	headers: Type.Ref(headersSchema),
	tags: ["Bloggers"],
	security: [{ userToken: [] }],
	querystring: Type.Object({
		search: Type.Optional(Type.String()),
	}),
	response: {
		200: Type.Array(BloggerSchema),
	},
};

export const getBloggersAdmin = {
	description: "Get all Bloggers (Admin)",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["Bloggers"],
	querystring: Type.Object({
		search: Type.Optional(Type.String()),
	}),
	response: {
		200: Type.Array(BloggerSchema),
	},
};

const createBloggerBody = Type.Object({
	name: LangObjectType,
	logo: Type.String(),
	email: Type.String(),
});
export const createBlogger = {
	description: "create blogger",
	tags: ["Bloggers"],
	security: [{ adminToken: [] }],
	body: createBloggerBody,
	response: {
		201: BloggerSchema,
	},
};

const updateBloggerBody = Type.Object({
	name: Type.Optional(LangObjectType),
	logo: Type.Optional(Type.String()),
	email: Type.Optional(Type.String()),
});
export const updateBlogger = {
	description: "update blogger",
	tags: ["Bloggers"],
	security: [{ adminToken: [] }],
	params: idParamObject,
	body: updateBloggerBody,
	response: {
		200: BloggerSchema,
	},
};

export const deleteBlogger = {
	description: "delete blogger",
	tags: ["Bloggers"],
	security: [{ adminToken: [] }],
	params: idParamObject,
	response: {
		200: responseMessage,
	},
};
