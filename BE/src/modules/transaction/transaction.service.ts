import { buildRequest } from './../../types/request';
import { PaginatedRequest, RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { TransactionModel } from "./transaction.model";
import { Admin } from "../admin/admin.model";
import { TransactionDto, TransactionResponse } from "./transaction.dto";
import dayjs from "dayjs";
import OrdersService from '../order/order.service';
import { OrderStatusEnum } from '../order/order.dto';
import ReturnOrderService from '../order/return-order.service';
import { ReturnOrderRequestStatusEnum, returnOrderStatus } from '../order/return-order.enum';
import AccountingService from '../accounting/accounting.service';

const TransactionService = (instance: FastifyInstance) => {
	const service = {
		findTransactionById: async (id: number) => {
			const transaction = await TransactionModel.findOne({ where: { id }, include: [{ model: Admin }] });

			if (!transaction) {
				throw instance.httpErrors.badRequest("transaction.response.notFound");
			}

			return transaction;
		},
		findTransactionByIdWithoutExp: async (id: number) => {
			const transaction = await TransactionModel.findOne({ where: { id }, include: [{ model: Admin }] });

			return transaction;
		},

		createTransaction: async (dto: RequestData<TransactionDto>) => {
			const orderService = OrdersService(instance);
			const order = await orderService.findOrderById({ id: dto.data.orderId, throwError: true, isAdmin: true });
			if (order!.status !== OrderStatusEnum.DELIVERED) throw instance.httpErrors.badRequest("transaction.response.orderNotCompleted");
			if (order!.vendorId !== dto.data.vendorId) throw instance.httpErrors.badRequest("transaction.response.vendorNotMatch");
			if (dayjs(new Date()).isSameOrBefore(dayjs(order?.createdAt).add(2, 'day'))) throw instance.httpErrors.badRequest("transaction.response.expired");
			if (order?.isPaid) throw instance.httpErrors.badRequest("transaction.response.orderAlreadyPaid");
			const returnOrderService = ReturnOrderService(instance);
			const returnOrder = await returnOrderService.findById({ id: dto.data.orderId, throwError: false, });
			if (returnOrder && returnOrder.status !== ReturnOrderRequestStatusEnum.Complete) throw instance.httpErrors.badRequest("transaction.response.returnOrderNotCompleted");
			const accountingService = AccountingService(instance);
			const accounting = await accountingService.getAccountingByOrderId(dto.data.orderId);
			const amount = accounting.amount;
			const transaction = new TransactionModel({
				...dto.data,
				amount,
				date: dayjs(dto.data.date).startOf("day").toISOString(),
			});
			await order!.update({ isPaid: true });
			await transaction.save();
			return transaction;
		},
		getUserTransactions: async (dto: PaginatedRequest<number>) => {
			const { request, langCode, limit, offset } = dto;
			if (!request.user.id) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			if (!request.permission.isAdmin) dto.data = request.user.id;
			const response = await TransactionModel.findAndCountAll({
				where: {
					vendorId: dto.data,
				},
				limit,
				offset,
			});
			return {
				count: response.count,
				rows: response.rows.map((el) => TransactionResponse(el, langCode, request.multiLang)),
			};
		},

		deleteTransactionById: async (dto: RequestData<number>) => {
			const account = await service.findTransactionById(dto.data);

			await account.destroy();

			return {
				message: "common.response.success",
			};
		},
		updateTransactionAttachment: async (dto: RequestData<{ id: number; attachment: string }>) => {
			const { data, request } = dto;
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const transaction = await service.findTransactionById(data.id);
			await transaction.update({ attachment: data.attachment });
			return {
				message: "common.response.success",
			};
		},
	};
	return service;
};
export default TransactionService;
