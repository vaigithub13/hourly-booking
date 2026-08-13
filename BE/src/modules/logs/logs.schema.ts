import { Type } from "@sinclair/typebox";
import { PaginatedSchema, PaginationQuerySchema, headersSchema } from "./../../utils/json-schema";
import { responseMessage } from "./../../types/common-types";
import { LogLevel, LogCategory } from "./logs.model";

export const logSchema = Type.Object({
	id: Type.Number(),
	level: Type.Enum(LogLevel),
	category: Type.Enum(LogCategory),
	message: Type.String(),
	details: Type.Optional(Type.String()),
	metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
	ipAddress: Type.Optional(Type.String()),
	userAgent: Type.Optional(Type.String()),
	endpoint: Type.Optional(Type.String()),
	method: Type.Optional(Type.String()),
	statusCode: Type.Optional(Type.Number()),
	responseTime: Type.Optional(Type.Number()),
	errorCode: Type.Optional(Type.String()),
	stackTrace: Type.Optional(Type.String()),
	userId: Type.Optional(Type.Number()),
	sessionId: Type.Optional(Type.String()),
	requestId: Type.Optional(Type.String()),
	createdAt: Type.String(),
	updatedAt: Type.String(),
});

export const getAllLogs = {
	description: "Get all logs with filtering and pagination",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["Logs"],
	querystring: Type.Object({
		level: Type.Optional(Type.Enum(LogLevel)),
		category: Type.Optional(Type.Enum(LogCategory)),
		userId: Type.Optional(Type.Number()),
		startDate: Type.Optional(Type.String({ format: "date-time" })),
		endDate: Type.Optional(Type.String({ format: "date-time" })),
		search: Type.Optional(Type.String()),
		...PaginationQuerySchema,
	}),
};

export const getLogById = {
	description: "Get a specific log by ID",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["Logs"],
	params: Type.Object({
		id: Type.Number(),
	}),
};

export const getLogStatistics = {
	description: "Get log statistics",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["Logs"],
	querystring: Type.Object({
		startDate: Type.Optional(Type.String({ format: "date-time" })),
		endDate: Type.Optional(Type.String({ format: "date-time" })),
	}),
	response: {
		200: Type.Object({
			totalLogs: Type.Number(),
			logsByLevel: Type.Record(Type.String(), Type.Number()),
			logsByCategory: Type.Record(Type.String(), Type.Number()),
			errorRate: Type.Number(),
			averageResponseTime: Type.Number(),
		}),
	},
};
