import { PaginatedRequest, RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { Accounting } from "./accounting.model";
import { AccountingResponseFullData, AccountingResponse, IAddAccounting, ISearchAccounting, IAccountingData, ISearchVendor } from "./accounting.dto";
import { Op, Sequelize, Transaction, WhereAttributeHash, WhereOptions } from "sequelize";
import { AccountingFilterService } from "./utils/accounting.filter-service";
import { Order } from "../order/order.model";
import { OrderItem } from "../order/order-item/order-item.model";
import { Admin } from "../admin/admin.model";
import { AccountingStatus } from "src/types/enums";
import { TransactionModel } from "../transaction/transaction.model";
import { AdminRole } from "../admin/utils/admin.enum";
import { ReturnOrder } from "../order/return-order.model";

const AccountingService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterAccounting: (search: ISearchAccounting): WhereAttributeHash<any> => {
			const filters = new AccountingFilterService();
      filters.equals('isRefunded' , false,)
			if (search.vendorId) filters.equals("vendorId", search.vendorId);
			if (search.date) filters.equals("createdAt", search.date);
			if (search.status) filters.equals("status", search.status);
			if (search.orderId) filters.equals("orderId", search.orderId);
			if (search.returnOrderId) filters.equals("returnOrderId", search.returnOrderId);
			if (search.name) filters.substringLangObjectOR("vendorName", search.name);
			return filters.build();
		},
		filterVendors: (search: ISearchVendor): WhereAttributeHash<any> => {
			const filters = new AccountingFilterService();
			if (search.name) filters.substringLangObjectOR("vendorName", search.name);
			return filters.build();
		},
	};
	const service = {
		addAccounting: async (data: IAddAccounting, transaction?: Transaction) => {
			await Accounting.create({ ...data }, { transaction });
		},
		updateAccountingAmount: async (orderId: number, amount: number, transaction?: Transaction) => {
			const accounting = await Accounting.findOne({ where: { orderId } });
			if (!accounting) return;

			await accounting.update({ amount: accounting.amount + amount }, { transaction });
		},
		getAllAccountings: async (dto: PaginatedRequest<ISearchAccounting>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			const filter = privateMethods.filterAccounting({
				...dto.data!,
				vendorId: isAdmin ? (dto.data!.vendorId ? dto.data!.vendorId : undefined) : dto.request!.user.id,
			});
			const { rows, count } = await Accounting.findAndCountAll({
				where: filter,
				include: [Admin],
				limit: dto.limit,
				offset: dto.offset,
				order: [["createdAt", "DESC"]],
			});
			return {
				count,
				accountings: rows.map((r) => AccountingResponse(r, dto.langCode)),
			};
		},
		getAccountingByCriteria: async (criteria: WhereOptions<Accounting>) => {
			const accounting = await Accounting.findOne({
				where: criteria,
			});
			if (!accounting) throw instance.httpErrors.notFound("common.response.notFound");
			return accounting;
		},
		getAccountingById: async (dto: number, langCode: string) => {
			const accounting = await Accounting.findByPk(dto, {
				include: [
					{
						model: Order,
						include: [OrderItem],
					},
					Admin,
				],
			});
			if (!accounting) throw instance.httpErrors.notFound("common.response.notFound");
			return {
				accounting: AccountingResponseFullData(accounting, langCode),
			};
		},
		getAccountingByOrderId: async (orderId: number) => {
			const accounting = await Accounting.findOne({ where: { orderId } });
			if (!accounting) throw instance.httpErrors.notFound("common.response.notFound");
			return accounting;
		},
		vendorAccounting: async (dto: PaginatedRequest<number>) => {
			const { limit, offset } = dto;
			const [
				total_revenue,
				total_revenue_without_delivery, //200
				totalInAccountings,
				totalOutAccountings,
				transactions,
				totalReturn,
				// allTransactions,
				allAccountings,
				accountingCount,
			] = await Promise.all([
				// total_revenue_without_delivery
				Order.findOne({
					where: {
						vendorId: dto.data,
					},
					attributes: [
						[
							Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.literal('"finalPrice" - "deliveryCost"')), 0),
							"total_revenue",
						],
					],
				}),
				// total_revenue
				Order.findOne({
					where: {
						vendorId: dto.data,
					},
					attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.literal('"finalPrice"')), 0), "total_revenue"]],
				}),
				// totalInAccountings
				Accounting.sum("amount", {
					where: {
						status: AccountingStatus.in,
						vendorId: dto.data,
            isRefunded : false,
					},
				}),
				// totalOutAccountings
				Accounting.sum("amount", {
					where: {
						status: AccountingStatus.out,
						vendorId: dto.data,
            isRefunded : false,
					},
				}),
				// transactions
				TransactionModel.sum("amount", {
					where: {
						vendorId: dto.data,
					},
				}),
				// totalReturn
				ReturnOrder.findOne({
					attributes: [[Sequelize.fn("SUM", Sequelize.literal(`"totalPrice"`)), "total_return"]],
					where: {
						vendorId: dto.data,
					},
				}),
				// allAccountings
				Accounting.findAll({
					where: {
						vendorId: dto.data,
            isRefunded : false,
					},
					include: [
						{
							model: Order,
							attributes: ["id", "status", "deliveryCost", [Sequelize.literal('COALESCE("finalPrice", 0)'), "order_revenue"]],
						},
						{
							model: ReturnOrder,
							attributes: [
								"id",
								"status",
								["totalPrice", "return_order_revenue"],
								// [Sequelize.literal('COALESCE("finalPrice", 0) - COALESCE("deliveryCost", 0)'), 'return_order_revenue']
							],
						},
					],
					order: [["createdAt", "DESC"]],
					limit,
					offset,
				}),
				// accountingCount
				Accounting.count({
					where: {
						vendorId: dto.data,
            isRefunded : false,
					},
				}),
			]);
			const total_revenue_value = total_revenue ? (total_revenue.get("total_revenue") as number) : 0;
			const total_revenue_without_delivery_value = total_revenue_without_delivery
				? (total_revenue_without_delivery.get("total_revenue") as number)
				: 0;
			const total_return_value = totalReturn ? (totalReturn.get("total_return") as number) : 0;
			//totalOutAccountings is return ORDER for vendor percentage
			//totalInAccountings is ORDER for vendor percentage
			// total order is 300 -- delivery is 100 total is 400
			// return one item is 100 .. total order is 200 witout delivery
			// total_revenue_without_delivery_value 200
			// vendor_share is 160
			// return item with value of 50
			// 20% of 300 (all order)- 20% of the 100 (return order)
			//
			// total_revenue_without_delivery_value - vendor_share - total_return_value,
			// 300 order price - 160 vendor price - 100 return order
			// 300 - 160 - 100
			const vendor = await Admin.findOne({ where: { id: dto.data } });

			if (!vendor) {
				throw instance.httpErrors.badRequest('Vendor not found');
			}
			const vendor_share = totalInAccountings - totalOutAccountings; // 160
			return {
				appPercentage: vendor.appPercentage,
				total_revenue: total_revenue_value, //400 - 100 this is the item price not delivery charge
				total_revenue_without_delivery_value: total_revenue_without_delivery_value, // 400 - 100 = 300 - 100 from the item = 200
				vendor_share: vendor_share,
				admin_revenue: total_revenue_without_delivery_value - vendor_share,
				paid: transactions,
				due: vendor_share - transactions,
				totalReturn: total_return_value,
				accountingCount,
				allAccountings: allAccountings.map((t) => ({
					id: t.id,
					orderId: t.orderId,
					amount: t.amount,
					type: t.status,
					status: t.order.status,
					deliveryCost: t.order.deliveryCost,
					order_revenue: t.order.get("order_revenue"),
					returnedOrderId: t.returnOrderId,
					returnedOrderStatus: t.returnOrder?.status || "",
					return_order_revenue: t.returnOrder?.get("return_order_revenue") || 0,
					date: t.createdAt,
				})),
			};
		},
		vendorAccountingForAll: async (dto: PaginatedRequest<IAccountingData>) => {
			const filter = privateMethods.filterVendors({
				...dto.data!,
			});

			// Fetch all vendors with name, logo, email, and owner name
			const { rows: vendors, count } = await Admin.findAndCountAll({
				attributes: ["id", "vendorName", "logo", "email", "ownerName"],
				where: {
					role: AdminRole.vendor,
					...filter,
				},
				order: [["createdAt", "DESC"]],
				limit: dto.limit,
				offset: dto.offset,
			});

			const vendorIds = vendors.map((v) => v.id);

			if (vendorIds.length === 0) return { count: 0, accountingData: [] };

			// Fetch total revenue for all vendors in one query without delivery charge
			const totalRevenueData = await Order.findAll({
				where: { vendorId: vendorIds },
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.literal('"finalPrice"')), "total_revenue"]],
				group: ["vendorId"],
			});

			// Fetch total revenue for all vendors in one query
			const totalRevenueDataWithoutDeliveryCharge = await Order.findAll({
				where: { vendorId: vendorIds },
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.literal('"finalPrice" - "deliveryCost"')), "total_revenue"]],
				group: ["vendorId"],
			});

			// Fetch commissions for all vendors in one query status in
			const commissionsInData = await Accounting.findAll({
				where: {
					status: AccountingStatus.in,
					vendorId: vendorIds,
          isRefunded : false,
				},
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.col("amount")), "commissions"]],
				group: ["vendorId"],
			});

			// Fetch commissions for all vendors in one query status out
			const commissionsOutData = await Accounting.findAll({
				where: {
					status: AccountingStatus.out,
					vendorId: vendorIds,
          isRefunded : false,
				},
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.col("amount")), "commissions"]],
				group: ["vendorId"],
			});

			// Fetch total returns for all vendors in one query
			const totalReturnData = await ReturnOrder.findAll({
				where: {
					vendorId: vendorIds,
				},
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.literal('"totalPrice"')), "total_return"]],
				group: ["vendorId"],
			});

			// Fetch transactions for all vendors in one query
			const transactionsData = await TransactionModel.findAll({
				where: { vendorId: vendorIds },
				attributes: ["vendorId", [Sequelize.fn("SUM", Sequelize.col("amount")), "transactions"]],
				group: ["vendorId"],
			});

			// Convert query results to lookup maps
			const totalRevenueMap = Object.fromEntries(totalRevenueData.map((d) => [d.vendorId, d.get("total_revenue")]));
			const totalRevenueWithoutDeliveryChargeMap = Object.fromEntries(
				totalRevenueDataWithoutDeliveryCharge.map((d) => [d.vendorId, d.get("total_revenue")])
			);
			const commissionsInMap = Object.fromEntries(commissionsInData.map((d) => [d.vendorId, d.get("commissions")]));
			const commissionsOutMap = Object.fromEntries(commissionsOutData.map((d) => [d.vendorId, d.get("commissions")]));
			const totalReturnMap = Object.fromEntries(totalReturnData.map((d) => [d.vendorId, d.get("total_return")]));
			const transactionsMap = Object.fromEntries(transactionsData.map((d) => [d.vendorId, d.get("transactions")]));

			// Construct the final response
			const accountingData = vendors.map(({ id, vendorName, logo, email, ownerName }) => {
				const total_revenue = totalRevenueMap[id] || 0;
				const commissionsIn = commissionsInMap[id] || 0;
				const commissionsOut = commissionsOutMap[id] || 0;
				const total_revenue_without_delivery_charge = totalRevenueWithoutDeliveryChargeMap[id] || 0;
				const total_return = totalReturnMap[id] || 0;
				const transactions = transactionsMap[id] || 0;
				const vendor_share = +commissionsIn - +commissionsOut;
				const due = vendor_share - +transactions; // Calculate due
				const admin_revenue = +total_revenue_without_delivery_charge - vendor_share;
				return {
					id,
					vendorName,
					email,
					logo,
					ownerName,
					total_revenue_without_delivery_charge,
					total_revenue, // Sum of finalPrice of orders - delivery cost
					commissions: commissionsIn, // Sum of amounts accounting type in
					total_return_commissions: commissionsOut, // Sum of amounts accounting type out
					transactions, // Sum of transactions amount for the vendor
					vendor_share: vendor_share, // Sum of accounting in - out
					admin_revenue: admin_revenue,
					due,
					paid: transactions,
					totalReturn: total_return,
				};
			});
			return { count, accountingData };
		},
	};
	return service;
};
export default AccountingService;
