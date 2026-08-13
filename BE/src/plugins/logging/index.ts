import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { LogLevel, LogCategory } from "../../modules/logs/logs.model";
import LogsService from "../../modules/logs/logs.service";
import fp from "fastify-plugin";

const loggingPlugin = async (fastify: FastifyInstance) => {
	// Add custom logging methods to fastify instance
	fastify.decorate("customLog", {
		info: async (message: string, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logApiRequest({
					level: LogLevel.INFO,
					category: LogCategory.SYSTEM,
					message,
					metadata: data,
				});
			} catch (error) {
				fastify.log.error(`Failed to log info: ${message}`, error);
			}
		},
		error: async (message: string, error?: Error, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logError({
					message,
					error,
					metadata: data,
				});
			} catch (logError) {
				fastify.log.error(`Failed to log error: ${message}`, logError);
			}
		},
		warn: async (message: string, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logApiRequest({
					level: LogLevel.WARN,
					category: LogCategory.SYSTEM,
					message,
					metadata: data,
				});
			} catch (error) {
				fastify.log.error(`Failed to log warn: ${message}`, error);
			}
		},
		debug: async (message: string, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logApiRequest({
					level: LogLevel.DEBUG,
					category: LogCategory.SYSTEM,
					message,
					metadata: data,
				});
			} catch (error) {
				fastify.log.error(`Failed to log debug: ${message}`, error);
			}
		},
		userAction: async (message: string, userId: number, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logUserAction({
					message,
					userId,
					metadata: data,
				});
			} catch (error) {
				fastify.log.error(`Failed to log user action: ${message}`, error);
			}
		},
		adminAction: async (message: string, userId: number, data?: any) => {
			try {
				const logsService = LogsService(fastify);
				await logsService.logAdminAction({
					message,
					userId,
					metadata: data,
				});
			} catch (error) {
				fastify.log.error(`Failed to log admin action: ${message}`, error);
			}
		},
	});

	// Request logging middleware
	fastify.decorate("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
		(request as any).startTime = Date.now();
	});

	// Response logging middleware
	fastify.decorate("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
		const responseTime = Date.now() - ((request as any).startTime || Date.now());
		const userId = (request as any).user?.id;
		const isAdmin = (request as any).permission?.isAdmin;

		// Determine log level based on status code
		let level = LogLevel.INFO;
		if (reply.statusCode >= 500) {
			level = LogLevel.ERROR;
		} else if (reply.statusCode >= 400) {
			level = LogLevel.WARN;
		}

		// Determine category based on route
		let category = LogCategory.API;
		if (request.url.includes("/auth") || request.url.includes("/login")) {
			category = LogCategory.AUTH;
		} else if (request.url.includes("/admin")) {
			category = LogCategory.ADMIN_ACTION;
		} else if (request.url.includes("/payment")) {
			category = LogCategory.PAYMENT;
		} else if (request.url.includes("/notification")) {
			category = LogCategory.NOTIFICATION;
		}

		// Log the API request
		try {
			const logsService = LogsService(fastify);
			await logsService.logApiRequest({
				level,
				category,
				message: `${request.method} ${request.url} - ${reply.statusCode}`,
				endpoint: request.url,
				method: request.method,
				statusCode: reply.statusCode,
				responseTime,
				userId,
				ipAddress: request.ip,
				userAgent: request.headers["user-agent"],
				metadata: {
					query: request.query,
					params: request.params,
					body: request.body,
				},
			});
		} catch (error) {
			fastify.log.error("Failed to log API request", error);
		}
	});

	// Error logging middleware
	fastify.decorate("onError", async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
		const userId = (request as any).user?.id;

		try {
			const logsService = LogsService(fastify);
			await logsService.logError({
				message: `Error in ${request.method} ${request.url}`,
				error,
				userId,
				ipAddress: request.ip,
				userAgent: request.headers["user-agent"],
				endpoint: request.url,
				method: request.method,
				metadata: {
					query: request.query,
					params: request.params,
				},
			});
		} catch (logError) {
			fastify.log.error("Failed to log error", logError);
		}
	});
}

export default fp(loggingPlugin, {
	name: "logging-plugin",
});
