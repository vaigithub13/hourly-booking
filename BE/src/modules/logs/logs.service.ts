import { FastifyInstance } from "fastify";
import { PaginatedRequest, RequestData } from "./../../types/request";
import { Log, LogLevel, LogCategory } from "./logs.model";
import { User } from "../user/user.model";
import {
	ICreateLogDto,
	IGetLogsQueryDto,
	IDeleteLogsByDateRangeDto,
	ILogStatisticsQueryDto,
	ILogStatisticsResponse,
	logResponse,
} from "./logs.dto";
import { translateMessage } from "./../../utils/common-methods";
import { Op } from "sequelize";

const LogsService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterGetLogsList: (query?: IGetLogsQueryDto) => {
			if (!query) return undefined;
			const { level, category, userId, startDate, endDate, search } = query;
			const where: any = {};

			if (level) where.level = level;
			if (category) where.category = category;
			if (userId) where.userId = userId;

			if (startDate || endDate) {
				where.createdAt = {};
				if (startDate) where.createdAt[Op.gte] = new Date(startDate);
				if (endDate) where.createdAt[Op.lte] = new Date(endDate);
			}

			if (search) {
				where[Op.or] = [
					{ message: { [Op.iLike]: `%${search}%` } },
					{ details: { [Op.iLike]: `%${search}%` } },
					{ endpoint: { [Op.iLike]: `%${search}%` } },
					{ errorCode: { [Op.iLike]: `%${search}%` } },
				];
			}

			return where;
		},

		buildDateRangeFilter: (startDate?: string, endDate?: string) => {
			const where: any = {};
			if (startDate || endDate) {
				where.createdAt = {};
				if (startDate) where.createdAt[Op.gte] = new Date(startDate);
				if (endDate) where.createdAt[Op.lte] = new Date(endDate);
			}
			return where;
		},
	};

	const service = {
		create: async (data: ICreateLogDto) => {
			const log = await Log.create(data);
		},

		findById: async (id: number) => {
			const log = await Log.findByPk(id, {
				include: [
					{
						model: User,
						as: "user",
						attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
					},
				],
			});
			if (!log) throw instance.httpErrors.notFound("log.response.notFound");
			return log;
		},

		findAll: async (dto: PaginatedRequest<IGetLogsQueryDto>) => {
			const query = dto.data;
			const where = privateMethods.filterGetLogsList(query);

			const { count, rows } = await Log.findAndCountAll({
				where,
				include: [
					{
						model: User,
						as: "user",
						attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
					},
				],
				order: [["createdAt", "DESC"]],
				limit: dto.limit,
				offset: dto.offset,
			});

			return {
				count,
				rows: rows.map((log: Log) => logResponse(log, dto.langCode)),
			};
		},

		delete: async (dto: RequestData<number>) => {
			const log = await service.findById(dto.data);
			await log.destroy();
			return {
				message: translateMessage("common.response.success", dto.langCode),
			};
		},

		deleteByDateRange: async (dto: RequestData<IDeleteLogsByDateRangeDto>) => {
			const { startDate, endDate, level, category } = dto.data;
			const where: any = privateMethods.buildDateRangeFilter(startDate, endDate);

			if (level) where.level = level;
			if (category) where.category = category;

			const deletedCount = await Log.destroy({ where });
			return { deletedCount };
		},

		getStatistics: async (dto: RequestData<ILogStatisticsQueryDto>) => {
			const { startDate, endDate } = dto.data;
			const where = privateMethods.buildDateRangeFilter(startDate, endDate);

			// Get total logs count
			const totalLogs = await Log.count({ where });

			// Get logs by level
			const logsByLevelResult = await Log.findAll({
				where,
				attributes: ["level", [instance.sequelize.fn("COUNT", instance.sequelize.col("id")), "count"]],
				group: ["level"],
				raw: true,
			});

			const logsByLevel: Record<string, number> = {};
			logsByLevelResult.forEach((item: any) => {
				logsByLevel[item.level] = parseInt(item.count);
			});

			// Get logs by category
			const logsByCategoryResult = await Log.findAll({
				where,
				attributes: ["category", [instance.sequelize.fn("COUNT", instance.sequelize.col("id")), "count"]],
				group: ["category"],
				raw: true,
			});

			const logsByCategory: Record<string, number> = {};
			logsByCategoryResult.forEach((item: any) => {
				logsByCategory[item.category] = parseInt(item.count);
			});

			// Calculate error rate
			const errorLogs = await Log.count({
				where: { ...where, level: LogLevel.ERROR },
			});
			const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

			// Calculate average response time
			const responseTimeResult = await Log.findOne({
				where: { ...where, responseTime: { [Op.ne]: null } },
				attributes: [[instance.sequelize.fn("AVG", instance.sequelize.col("responseTime")), "avgResponseTime"]],
				raw: true,
			});

			const averageResponseTime = responseTimeResult?.avgResponseTime ? parseFloat(responseTimeResult.avgResponseTime) : 0;

			return {
				totalLogs,
				logsByLevel,
				logsByCategory,
				errorRate: Math.round(errorRate * 100) / 100,
				averageResponseTime: Math.round(averageResponseTime * 100) / 100,
			};
		},

		// Utility method to log API requests
		logApiRequest: async (data: {
			level: LogLevel;
			category: LogCategory;
			message: string;
			endpoint?: string;
			method?: string;
			statusCode?: number;
			responseTime?: number;
			userId?: number;
			ipAddress?: string;
			userAgent?: string;
			details?: string;
			metadata?: Record<string, any>;
		}) => {
			await Log.create(data);
		},

		// Utility method to log errors
		logError: async (data: {
			message: string;
			error?: Error;
			userId?: number;
			ipAddress?: string;
			userAgent?: string;
			endpoint?: string;
			method?: string;
			metadata?: Record<string, any>;
		}) => {
			const logData = {
				level: LogLevel.ERROR,
				category: LogCategory.SYSTEM,
				message: data.message,
				details: data.error?.message,
				stackTrace: data.error?.stack,
				userId: data.userId,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
				endpoint: data.endpoint,
				method: data.method,
				metadata: data.metadata,
			};

			await Log.create(logData);
		},

		// Utility method to log user actions
		logUserAction: async (data: {
			message: string;
			userId: number;
			ipAddress?: string;
			userAgent?: string;
			endpoint?: string;
			method?: string;
			metadata?: Record<string, any>;
		}) => {
			const logData = {
				level: LogLevel.INFO,
				category: LogCategory.USER_ACTION,
				message: data.message,
				userId: data.userId,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
				endpoint: data.endpoint,
				method: data.method,
				metadata: data.metadata,
			};

			await Log.create(logData);
		},

		// Utility method to log admin actions
		logAdminAction: async (data: {
			message: string;
			userId: number;
			ipAddress?: string;
			userAgent?: string;
			endpoint?: string;
			method?: string;
			metadata?: Record<string, any>;
		}) => {
			const logData = {
				level: LogLevel.INFO,
				category: LogCategory.ADMIN_ACTION,
				message: data.message,
				userId: data.userId,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
				endpoint: data.endpoint,
				method: data.method,
				metadata: data.metadata,
			};

			await Log.create(logData);
		},
	};

	return service;
};

export default LogsService;
