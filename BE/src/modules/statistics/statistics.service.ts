import { OrderFilterService } from "./../order/utils/order-filter-service";
import { FastifyInstance } from "fastify";
import { getAdminSalesStatistics } from "./statistics.schema";
import { User } from "../user/user.model";
import { Admin } from "../admin/admin.model";
import { AdminRole } from "../admin/utils/admin.enum";
import { RequestData } from "src/types/request";
import {
	GetOrderStatisticsLineChart,
	GetTotalCustomers,
	GetTotalOrder,
	GetTotalReturnOrders,
	GetTotalRevenue,
	GetTotalVendors,
	GetUserStatisticsLineChart,
} from "./statstics.dto";
import { CancelOrderRequest, Order } from "../order/order.model";
import { filter } from "ramda";
import { UserTypeEnum } from "src/types/common-types";
import { FilterService } from "src/utils/filtering/filter-service";
import { ReturnOrder } from "../order/return-order.model";
import { VendorStatus } from "../admin/admin.dto";
import { col, fn, Op } from "sequelize";
import { Accounting } from "../accounting/accounting.model";
import { AccountingStatus } from "src/types/enums";
import { OrderStatusEnum } from "../order/order.dto";

const StatisticsService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterOrders: (query?: any | GetTotalOrder | GetTotalRevenue) => {
			if (!query) return undefined;
			const filters = new OrderFilterService();
			if (query.from && query.to) filters.dateInRange("createdAt", query.from, query.to);
			if (query.vendorId) filters.equals("vendorId", +query.vendorId);
			if (query.status) filters.equals("status", query.status);

			return filters.build();
		},
		filterReturnRequests: (query?: GetTotalReturnOrders) => {
			if (!query) return undefined;
			const filters = new FilterService();

			if (query.vendorId) filters.equals("vendorId", query.vendorId);
			if (query.status) filters.equals("status", query.status);
			return filters.build();
		},
	};

	const service = {
		getTotalOrders: async (dto: RequestData<GetTotalOrder>) => {
			const query = {
				...dto.data,
				vendorId: dto.request?.user.role === UserTypeEnum.VENDOR ? dto.request?.user.id : undefined,
			};
			const filter = privateMethods.filterOrders(query);
			const result = await Order.count({ where: filter });

			return { result };
		},
		getTotalCustomers: async (dto: RequestData<GetTotalCustomers>) => {
			const result = await User.count({});

			return { result };
		},
		getTotalVendors: async (dto: RequestData<GetTotalVendors>) => {
			const result = await Admin.count({ where: { role: AdminRole.vendor, status: VendorStatus.Approved } });

			return { result };
		},
		getTotalReturnOrders: async (dto: RequestData<GetTotalReturnOrders>) => {
			const filter = privateMethods.filterReturnRequests({
				...dto.data,
				vendorId: dto.request?.user.role === UserTypeEnum.VENDOR ? dto.request?.user.id : undefined,
			});

			const result = await ReturnOrder.count({ where: filter });

			return { result };
		},
		getTotalRevenue: async (dto: RequestData<GetTotalRevenue>) => {
			const filter = privateMethods.filterOrders({
				...dto.data,
				vendorId: dto.request?.user.role === UserTypeEnum.VENDOR ? dto.request?.user.id : undefined,
			});
			const result = await Order.sum("finalPrice", {
				where: { ...filter, status: { [Op.ne]: OrderStatusEnum.CANCELLED } },
			});

			return { result: result };
		},
		getTotalEarning: async (dto: RequestData<GetTotalRevenue>) => {
			const filter = privateMethods.filterOrders({
				...dto.data,
				vendorId: dto.request?.user.role === UserTypeEnum.VENDOR ? dto.request?.user.id : undefined,
			});

			const vendorProfit = await Accounting.sum("amount", { where: { ...filter, status: AccountingStatus.in } });
			const vendorLoss = await Accounting.sum("amount", { where: { ...filter, status: AccountingStatus.out } });
			if (dto.request?.user.role === UserTypeEnum.VENDOR) {
				return { result: vendorProfit - vendorLoss };
			}
			const totalOrderPrice = await Order.sum("finalPrice", {
				where: { ...filter, status: { [Op.ne]: OrderStatusEnum.CANCELLED } },
			});
			const delivery = await Order.sum("deliveryCost", {
				where: { ...filter, status: { [Op.ne]: OrderStatusEnum.CANCELLED } },
			});
			const fullyReturned = await Order.sum("deliveryCost", {
				where: { ...filter, status: OrderStatusEnum.DELIVERED, finalPrice: 0 },
			});

			return { result: totalOrderPrice - (vendorProfit - vendorLoss) - delivery };
		},
		getOrderStatisticsLineChart: async (dto: RequestData<GetOrderStatisticsLineChart>) => {
			const filter = privateMethods.filterOrders({
				...dto.data,
				vendorId: dto.request?.user.role === UserTypeEnum.VENDOR ? dto.request?.user.id : undefined,
			});
			const orders = await Order.findAll({
				where: filter,
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("COUNT", col("*")), "count"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});
			const returnOrders = await ReturnOrder.findAll({
				where: filter,
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("COUNT", col("*")), "count"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});
			const cancelOrders = await CancelOrderRequest.findAll({
				where: filter,
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("COUNT", col("*")), "count"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});

			return { orders, returnOrders, cancelOrders };
		},
		getUserStatisticsLineChart: async (dto: RequestData<GetUserStatisticsLineChart>) => {
			const filter = privateMethods.filterOrders({
				...dto.data,
			});
			const vendors = await Order.findAll({
				where: { ...filter, role: AdminRole.vendor },
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("COUNT", col("*")), "count"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});
			const customers = await User.findAll({
				where: filter,
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("COUNT", col("*")), "count"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});

			return { customers, vendors };
		},
		getRevenueStatisticsLineChart: async (dto: RequestData<GetUserStatisticsLineChart>) => {
			const filter = privateMethods.filterOrders({
				...dto.data,
			});
			const revenue = await Order.findAll({
				where: { ...filter },
				attributes: [
					[fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD"), "date"],
					[fn("SUM", col("finalPrice")), "sum"],
				],
				group: [fn("TO_CHAR", col("createdAt"), "YYYY-MM-DD")],
				raw: true,
			});

			return { revenue };
		},
	};
	return service;
};
export default StatisticsService;
65;
