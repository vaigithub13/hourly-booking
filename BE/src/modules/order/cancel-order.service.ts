import { FastifyInstance } from "fastify";
import { OrderStatusEnum, PaymentStatusEnum } from "./order.dto";
import { PaginatedRequest, RequestData, buildRequest } from "src/types/request";
import OrdersService from "./order.service";
import { CancelOrderRequest, Order } from "./order.model";
import { UserTypeEnum } from "src/types/common-types";
import AdminService from "../admin/admin.service";
import { orderCriteria, translateMessage } from "src/utils/common-methods";
import { FilterService } from "src/utils/filtering/filter-service";
import { Location } from "../locations/locations.model";
import {
	CancelOrderRequestStatusEnum,
	IApproveRequest,
	ICancelOrderRequest,
	ICreateCancelOrderRequest,
	IGetCancelOrderRequestsQueryDto,
	ISetRefundTarget,
	cancelOrderRequestResponse,
} from "./cancel-order.dto";
import { FindOptions, OrderItem, Transaction } from "sequelize";
import WalletService from "../wallet/wallet.service";
import AccountingService from "../accounting/accounting.service";
import { AccountingStatus } from "src/types/enums";
import { ICreateReturnOrderRequest } from "./return-order.dto";
import OrderTrackingService from "../order-tracking/order-tracking.service";
import { ReturnOrder, ReturnOrderItems } from "./return-order.model";
import { setRefundTarget } from "./order.schema";
import { Admin } from "../admin/admin.model";
import { User } from "../user/user.model";

export const CancelOrderService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterCancelRequests: (query?: IGetCancelOrderRequestsQueryDto) => {
			if (!query) return undefined;
			const filters = new FilterService();
			const { userId, vendorId } = query;
			if (userId) filters.equals("userId", userId);
			if (vendorId) filters.equals("vendorId", vendorId);
			return filters.build();
		},
	};

	const service = {
		findById: async (data: { id: number; transaction?: Transaction; throwError: boolean }) => {
			const { id, transaction, throwError } = data;
			const options: FindOptions<CancelOrderRequest> = {
				transaction,
				include: [{ model: Order, include: [Location] }],
			};
			const cancelReq = await CancelOrderRequest.findByPk(id, options);
			if (!cancelReq && throwError) throw instance.httpErrors.notFound("cancelOrderReq.response.notFound");
			return cancelReq;
		},

		findCancelRequestByOrderId: async (data: { orderId: number; transaction?: Transaction; throwError?: boolean }) => {
			const { orderId, throwError = false, transaction } = data;
			const options: FindOptions<CancelOrderRequest> = {
				transaction,
				include: [Order],
				where: { orderId },
			};
			const cancelReq = await CancelOrderRequest.findOne(options);
			if (!cancelReq && throwError) throw instance.httpErrors.notFound("orderCancelReq.response.notFound");
			return cancelReq;
		},

		cancelOrder: async (data: { orderId: number; transaction?: Transaction }) => {
			const { orderId, transaction } = data;
			const orderService = OrdersService(instance);
			const order = (await orderService.findOrderById({
				id: orderId,
				onlyItems: true,
				throwError: true,
				isAdmin: false,
			})) as Order;

			await order.update(
				{
					status: OrderStatusEnum.CANCELLED,
					canBeCanceled: false,
					paymentStatus: PaymentStatusEnum.REFUNDED,
				},
				{ transaction }
			);

			// re-adding the deducted amount from skus quantity
			await Promise.all(
				order.get("items").map(async (item) => {
					const sku = item.get("sku");
					await sku.increment("amount", {
						by: item.get("quantity"),
						transaction,
					});
					return true;
				})
			);

			return true;
		},

		findAll: async (dto: PaginatedRequest<IGetCancelOrderRequestsQueryDto>) => {
			const { limit, offset } = dto;
			const query = dto.data as IGetCancelOrderRequestsQueryDto;
			const isAdmin = dto.request.permission.isAdmin || false;
			const reqUser = dto.request?.user;

			if (reqUser?.role === UserTypeEnum.VENDOR) query.vendorId = reqUser.id;
			if (reqUser?.role === UserTypeEnum.USER) query.userId = reqUser.id;

			const { count, rows } = await CancelOrderRequest.findAndCountAll({
				where: privateMethods.filterCancelRequests(query),
				include: [{ model: Order, include: [Location] }, { model: User }, { model: Admin }],
				limit,
				offset,
				order: orderCriteria({}),
			});
			const response = {
				count,
				rows: rows.map((cancelReq: CancelOrderRequest) =>
					cancelOrderRequestResponse({
						cancelReq,
						langCode: dto.langCode,
						multiLang: isAdmin,
					})
				),
			};
			return response;
		},

		approve: async (transaction: Transaction, dto: RequestData<IApproveRequest>) => {
			const { cancelReqId } = dto.data;
			const reqUser = dto.request!.user;
			const cancelReq = (await service.findById({
				id: cancelReqId,
				throwError: true,
				transaction,
			})) as CancelOrderRequest;

			{
				// Handling the wallet refund
				{
					const walletsService = WalletService(instance);
					await walletsService.updateBalance(reqUser.id, +cancelReq.get("order").get("finalPrice"), transaction);
				}

				// Handling the accounting record
				{
					const accountingService = AccountingService(instance);

					const orderInAccounting = await accountingService.getAccountingByCriteria({
						orderId: cancelReq.order.id,
						status: AccountingStatus.in,
					});
					await orderInAccounting.update({ amount: 0 }, { transaction });
				}
				// Cancelling the main order
				await service.cancelOrder({
					orderId: cancelReq.get("orderId"),
					transaction,
				});
			}

			// Updating the req status
			await cancelReq.update({ status: CancelOrderRequestStatusEnum.REFUNDED }, { transaction });

			const response = cancelOrderRequestResponse({
				cancelReq,
				langCode: dto.langCode,
				multiLang: false,
			});
			return response;
		},

		createCancelOrderRequest: async (transaction: Transaction, dto: RequestData<ICreateCancelOrderRequest>) => {
			const { orderId } = dto.data;

			const isAdmin = dto.request!.permission.isAdmin || false;
			const orderService = OrdersService(instance);
			const order = (await orderService.findOrderById({
				id: orderId,
				throwError: true,
				isAdmin: false,
			})) as Order;

			if (dto.request?.user.role === UserTypeEnum.VENDOR && order.vendorId === dto.request.user.id) {
				throw instance.httpErrors.badRequest("order not found");
			}

			if (!isAdmin && dto.request?.user.role === UserTypeEnum.USER) {
				const userId = dto.request!.user.id;
				await instance.authorizeUserResource(order, userId);
			}

			// Doing validations
			{
				if (!order.get("canBeCanceled")) {
					throw instance.httpErrors.badRequest("order.response.cannotCancel");
				}
				const oldReq = await service.findCancelRequestByOrderId({
					orderId,
					throwError: false,
				});
				if (oldReq) {
					throw instance.httpErrors.badRequest("orderCancelReq.response.alreadyExist");
				}
			}

			let cancelReq = await CancelOrderRequest.create(
				{
					userId: order.get("userId"),
					orderId,
					vendorId: order.get("vendorId"),
				},
				{ transaction }
			);

			cancelReq = (await service.findById({
				id: cancelReq.get("id"),
				throwError: true,
				transaction,
			})) as CancelOrderRequest;

			await order.update({ status: OrderStatusEnum.CANCELLED }, { transaction });
			const walletService = WalletService(instance);
			console.log('wallet', order.userId, order.finalPrice);
			await walletService.updateBalance(order.userId, order.finalPrice, transaction);

			return cancelOrderRequestResponse({
				cancelReq,
				langCode: dto.langCode,
				multiLang: isAdmin,
			});
		},

		setRefundTarget: async (transaction: Transaction, dto: RequestData<ISetRefundTarget>) => {
			const { cancelRequest, refundTarget } = dto.data;
			if (cancelRequest.get("refundTarget") !== "Pending") {
				throw instance.httpErrors.badRequest("cancelOrderReq.response.refundTargetAlreadySet");
			}
			await cancelRequest.update({ refundTarget, status: CancelOrderRequestStatusEnum.REFUNDED }, { transaction });
			return cancelRequest;
		},

		createReturnOrderRequest: async (transaction: Transaction, dto: RequestData<ICreateReturnOrderRequest>) => {
			const { orderId } = dto.data;
			const userId = dto.request!.user.id;
			const orderService = OrdersService(instance);
			const order = (await orderService.findMyOrderById({
				id: orderId,
				userId: dto.request!.user.id as number,
				fullInfo: true,
			})) as Order;

			// await instance.authorizeUserResource(order, userId);

			// Doing validations

			if (!order.get("canBeReturned")) {
				throw instance.httpErrors.badRequest("order.response.cannotReturn");
			}

			// validating the productId and the quantity
			const productMap = new Map<number, number>();
			for (const item of order.items) {
				productMap.set(item.skuId, item.quantity);
			}

			for (const product of dto.data.products) {
				if (!productMap.has(product.id)) {
					throw instance.httpErrors.badRequest("order.response.notInOrder");
				}

				const orderedQuantity = productMap.get(product.id)!;
				if (orderedQuantity < product.quantity) {
					throw instance.httpErrors.badRequest("order.response.notOrderedQuantity");
				}
			}

			let returnOrderReq = await ReturnOrder.create(
				{
					userId,
					orderId,
					vendorId: order.get("vendorId"),
				},
				{ transaction }
			);
			const returnOrderItemsData = dto.data.products.map((product) => {
				return {
					skuId: product.id,
					quantity: product.quantity,
					returnOrderId: returnOrderReq.id,
				};
			});
			await ReturnOrderItems.bulkCreate(returnOrderItemsData, { transaction });
			await order.update({ canBeReturned: false }, { transaction });
		},
	};
	return service;
};

export default CancelOrderService;
