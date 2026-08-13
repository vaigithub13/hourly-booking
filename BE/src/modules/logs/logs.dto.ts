import { Log, LogLevel, LogCategory } from "./logs.model";

export interface ICreateLogDto {
	level: LogLevel;
	category: LogCategory;
	message: string;
	details?: string;
	metadata?: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
	endpoint?: string;
	method?: string;
	statusCode?: number;
	responseTime?: number;
	errorCode?: string;
	stackTrace?: string;
	userId?: number;
	sessionId?: string;
	requestId?: string;
}

export interface IGetLogsQueryDto {
	level?: LogLevel;
	category?: LogCategory;
	userId?: number;
	startDate?: string;
	endDate?: string;
	search?: string;
	limit?: number;
	offset?: number;
}

export interface IDeleteLogsByDateRangeDto {
	startDate: string;
	endDate: string;
	level?: LogLevel;
	category?: LogCategory;
}

export interface ILogStatisticsQueryDto {
	startDate?: string;
	endDate?: string;
}

export interface ILogStatisticsResponse {
	totalLogs: number;
	logsByLevel: Record<string, number>;
	logsByCategory: Record<string, number>;
	errorRate: number;
	averageResponseTime: number;
}

export const logResponse = (log: Log, langCode: string = "en") => {
	return {
		id: log.id,
		level: log.level,
		category: log.category,
		message: log.message,
		details: log.details,
		metadata: log.metadata,
		ipAddress: log.ipAddress,
		userAgent: log.userAgent,
		endpoint: log.endpoint,
		method: log.method,
		statusCode: log.statusCode,
		responseTime: log.responseTime,
		errorCode: log.errorCode,
		stackTrace: log.stackTrace,
		userId: log.userId,
		sessionId: log.sessionId,
		requestId: log.requestId,
		createdAt: log.createdAt,
		updatedAt: log.updatedAt,
	};
};
