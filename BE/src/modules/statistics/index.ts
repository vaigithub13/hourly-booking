import { buildRequest, PaginatedRequest, RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import * as schema from "./statistics.schema";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";
import StatisticsService from "./statistics.service";
import {
	GetOrderStatisticsLineChart,
	GetTotalCustomers,
	GetTotalEarning,
	GetTotalOrder,
	GetTotalReturnOrders,
	GetTotalRevenue,
	GetUserStatisticsLineChart,
} from "./statstics.dto";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const statisticsService = StatisticsService(fastify);

	instance.get(
		"/total-orders",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalOrders,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalOrders>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalOrders(buildRequest(request.query as GetTotalOrder, langCode, request));
			return banners;
		}
	);
	instance.get(
		"/total-return-orders",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalReturnOrders,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalReturnOrders>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalReturnOrders(
				buildRequest(request.query as GetTotalReturnOrders, langCode, request)
			);
			return banners;
		}
	);
	instance.get(
		"/total-customers",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalCustomers,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalCustomers>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalCustomers(buildRequest(request.query as GetTotalCustomers, langCode, request));
			return banners;
		}
	);
	instance.get(
		"/total-vendors",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalVendors,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalVendors>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalVendors(buildRequest(request.query as GetTotalCustomers, langCode, request));
			return banners;
		}
	);
	instance.get(
		"/total-revenue",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalRevenue,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalRevenue>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalRevenue(buildRequest(request.query as GetTotalRevenue, langCode, request));
			return banners;
		}
	);
	instance.get(
		"/total-earning",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.getTotalEarning,
		},
		async (request: FastifyRequestTypebox<typeof schema.getTotalEarning>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getTotalEarning(buildRequest(request.query as GetTotalEarning, langCode, request));
			return banners;
		}
	);
	instance.get(
		"/orders-statistics-line-chart",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.ordersStatisticsLineChart,
		},
		async (request: FastifyRequestTypebox<typeof schema.ordersStatisticsLineChart>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getOrderStatisticsLineChart(
				buildRequest(request.query as GetOrderStatisticsLineChart, langCode, request)
			);
			return banners;
		}
	);
	instance.get(
		"/users-statistics-line-chart",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.usersStatisticsLineChart,
		},
		async (request: FastifyRequestTypebox<typeof schema.usersStatisticsLineChart>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getUserStatisticsLineChart(
				buildRequest(request.query as GetUserStatisticsLineChart, langCode, request)
			);
			return banners;
		}
	);
	instance.get(
		"/revenue-statistics-line-chart",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.revenueStatisticsLineChart,
		},
		async (request: FastifyRequestTypebox<typeof schema.revenueStatisticsLineChart>) => {
			const langCode = request.headers["x-lang"];
			const banners = await statisticsService.getRevenueStatisticsLineChart(
				buildRequest(request.query as GetUserStatisticsLineChart, langCode, request)
			);
			return banners;
		}
	);
};
