import { AdminRole } from "./../admin/utils/admin.enum";
import { FastifyInstance } from "fastify";
import { OrderStatusEnum, passCompanyStatus } from "./order.dto";
import { PaginatedRequest, RequestData, buildRequest } from "src/types/request";
import OrdersService from "./order.service";
import { Order } from "./order.model";
import { UserTypeEnum } from "src/types/common-types";
import AdminService from "../admin/admin.service";
import { orderCriteria, translateMessage } from "src/utils/common-methods";
import { FilterService } from "src/utils/filtering/filter-service";
import { Location } from "../locations/locations.model";
import {
	IApproveOrRejectRequest,
	ICreateReturnOrderRequest,
	IGetReturnOrderRequestsQueryDto,
	returnOrderRequestResponse,
	returnOrderStatusForTracking,
} from "./return-order.dto";
import { FindOptions, Op, Transaction } from "sequelize";
import WalletService from "../wallet/wallet.service";
import AccountingService from "../accounting/accounting.service";
import { AccountingStatus } from "src/types/enums";
import { Product, SKU } from "../product/product.model";
import { User } from "../user/user.model";
import { Vendor } from "../vendor/vendor.model";
import { Admin } from "../admin/admin.model";
import { OrderItem } from "./order-item/order-item.model";
import { CustomAttributes } from "../custom_attributes/custom_attributes.model";
import { filter, last } from "ramda";
import { symlink } from "fs";
import { Wallet } from "../wallet/wallet.model";
import userAddress from "../user-address";
import UserAddressService from "../user-address/user-address.service";
import { UserAddress } from "../user-address/user-address.model";
import { ReturnOrder, ReturnOrderItems } from "./return-order.model";
import NotificationService from "../notification/notification.service";
import { INotificationType } from "../notification/dto";
import { RefundTargetEnum } from "./cancel-order.dto";
import axios from "axios";
import { orderItemIncludes } from "./order-item/utils/fetchables";
import { Configuration } from "../configuration/configuration.model";
import ConfigurationService from "../configuration/configuration.service";
import { ReturnOrderRequestStatusEnum, returnOrderStatus, ReturnOrderStatusData } from "./return-order.enum";

export const ReturnOrderService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterReturnRequests: (query?: IGetReturnOrderRequestsQueryDto) => {
			if (!query) return undefined;
			const filters = new FilterService();

			if (query.userId) filters.equals("userId", query.userId);
			if (query.vendorId) filters.equals("vendorId", query.vendorId);
			if (query.id) filters.equals("id", query.id);
			if (query.status) filters.equals("status", query.status);
			return filters.build();
		},
		findOne: async (query?: IGetReturnOrderRequestsQueryDto) => {
			const returnOrder = await ReturnOrder.findOne({
				where: privateMethods.filterReturnRequests({ ...query }),
				include: [
					{ model: ReturnOrderItems, include: [SKU] },
					User,
					Admin,
					UserAddress,
					{ model: Order, include: [Location, OrderItem] },
				],
			});
			const f = [
				{ model: ReturnOrderItems, include: [SKU] },
				User,
				Admin,
				UserAddress,
				{ model: Order, include: [Location, OrderItem] },
			];
			if (!returnOrder) throw instance.httpErrors.notFound("order.response.notFound");
			return returnOrder;
		},
	};

	const service = {
		getStatus: (status: string) => {
			const passStatus = passCompanyStatus.find((s) => s.status == status);
			if (!passStatus) return -1;
			return returnOrderStatusForTracking.findIndex((s) => s.code == passStatus.code);
		},
		findById: async (data: { id: number; transaction?: Transaction; throwError: boolean }) => {
			const { id, transaction, throwError } = data;
			const options: FindOptions<ReturnOrder> = {
				transaction,
				include: [
					{
						model: ReturnOrderItems,
						include: [
							{
								model: SKU,
								include: [Product, { association: "attributes" }],
								paranoid: false,
							},
							{
								model: Product,
							},
						],
					},
					User,
					Admin,
					UserAddress,
					{ model: Order, include: [Location, { model: OrderItem, include: orderItemIncludes({ all: true, isAdmin: true }) }] },
				],
			};
			const returnReq = await ReturnOrder.findByPk(id, options);
			if (!returnReq && throwError) throw instance.httpErrors.notFound("returnOrderReq.response.notFound");
			return returnReq;
		},
		findByOrderId: async (data: { orderId: number; transaction?: Transaction; throwError?: boolean }) => {
			const { orderId, transaction, throwError } = data;
			const options: FindOptions<ReturnOrder> = { transaction, where: { orderId } };
			const returnReq = await ReturnOrder.findOne(options);
			if (!returnReq && throwError) throw instance.httpErrors.notFound("returnOrderReq.response.notFound");
			return returnReq;
		},
		findByTaskId: async (data: { taskId: string; transaction?: Transaction; throwError?: boolean }) => {
			const { taskId, transaction, throwError } = data;
			const options: FindOptions<ReturnOrder> = {
				transaction,
				include: [
					{
						model: ReturnOrderItems,
						include: [{ model: SKU, include: [CustomAttributes, Product] }],
					},
					User,
					Admin,
					UserAddress,
					{ model: Order, include: [Location, OrderItem] },
				],
			};
			const returnReq = await ReturnOrder.findOne({ where: { taskId }, ...options });
			if (!returnReq && throwError) throw instance.httpErrors.notFound("returnOrderReq.response.notFound");
			return returnReq;
		},

		getOneReturnOrderVendor: async (dto: RequestData<number>) => {
			const returnOrder = (await service.findById({
				id: dto.data,
				throwError: true,
			})) as ReturnOrder;

			if (
				(dto.request?.user.role === UserTypeEnum.VENDOR && returnOrder.vendorId !== dto.request?.user.id) ||
				(dto.request?.user.role === UserTypeEnum.USER && dto.request?.user.id !== returnOrder.userId)
			) {
				throw instance.httpErrors.unauthorized("not authorized");
			}

			return returnOrderRequestResponse({
				returnReq: returnOrder,
				langCode: dto.langCode,
				multiLang: false,
			});
		},

		completeReturnOrder: async (dto: RequestData<number>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			const transaction = await instance.db.transaction();
			try {
				const returnOrder = await privateMethods.findOne({
					id: dto.data,
					status: ReturnOrderRequestStatusEnum.OnTheWay,
				});
				for (const item of returnOrder.items) {
					const sku = await SKU.findByPk(item.skuId);
					if (sku && sku.amount !== null)
						await sku.update(
							{
								amount: item.quantity + sku.amount,
							},
							{ transaction }
						);
				}
				const walletService = WalletService(instance);
				await returnOrder.update(
					{
						status: ReturnOrderRequestStatusEnum.Complete,
						tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[5], loggedAt: new Date() }],
					},
					{ transaction }
				);
				const orderService = OrdersService(instance);
				const order = await orderService.findOrderById({
					id: returnOrder.orderId,
					throwError: true,
					isAdmin,
					transaction,
				});
				const configService = ConfigurationService(instance);
				const configuration = await configService.find();
				let delivery = returnOrder.deliveryPaidByVendor ? configuration.deliveryPricing.insideDoha : 0;
				if (returnOrder.deliveryPaidByVendor && returnOrder.totalPrice === order?.finalPrice || 0 - order!.deliveryCost || 0) {
					delivery += order!.deliveryCost;
				}
				await order!.update({ returnedPrice: returnOrder.totalPrice + delivery }, { transaction });

				const accountingService = AccountingService(instance);
				const adminsService = AdminService(instance);
				const vendor = await adminsService.findVendorById(returnOrder.get("vendorId"));

				await accountingService.updateAccountingAmount(
					returnOrder.orderId,
					(((100 - vendor.get("appPercentage")) * returnOrder.get("totalPrice")) / 100.0 + delivery) * -1,
					transaction
				);
				const newReturnOrder = await service.findById({
					id: returnOrder.id,
					throwError: true,
					transaction,
				});

				await transaction.commit();
				try {
					const notificationService = NotificationService(instance);
					await notificationService.sendSpecificNotification({
						type: INotificationType.ReturnOrderStatus,
						params: [
							{
								en: returnOrder.orderId.toString(),
								ar: returnOrder.orderId.toString(),
							},
							{
								en: returnOrderStatus[ReturnOrderRequestStatusEnum.Complete].en,
								ar: returnOrderStatus[ReturnOrderRequestStatusEnum.Complete].ar,
							},
						],
						userIds: [returnOrder.userId],
						data: {
							returnOrderId: returnOrder.id,
						},
					});
				} catch (err) {
					console.log(err);
				}
				return returnOrderRequestResponse({
					returnReq: newReturnOrder!,
					langCode: dto.langCode,
					multiLang: true,
				});
			} catch (ex) {
				await transaction.rollback();
				throw instance.httpErrors.internalServerError((ex as string) || "error");
			}
		},
		refundReturnOrder: async (dto: RequestData<{ id: number; refundTarget: RefundTargetEnum; amount?: number }>) => {
			const returnOrder = await privateMethods.findOne({
				id: dto.data.id,
			});

			if (returnOrder?.status !== ReturnOrderRequestStatusEnum.Complete) {
				throw instance.httpErrors.badRequest("cannot update the return order because the status is completed");
			}

			if (dto.data.amount && dto.data.refundTarget === RefundTargetEnum.ORIGINAL_METHOD) {
				throw instance.httpErrors.badRequest("validation error");
			}
			const walletService = WalletService(instance);

			await returnOrder.update({
				refundTarget: dto.data.refundTarget,
				amountReturnedToWallet: dto.data.amount || 0,
			});

			if (dto.data.refundTarget === RefundTargetEnum.WALLET)
				await walletService.updateBalance(returnOrder.userId, dto.data.amount || 0, undefined, true);
			const newReturnOrder = await privateMethods.findOne({ id: dto.data.id });
			console.log(newReturnOrder.items);
			return returnOrderRequestResponse({
				returnReq: newReturnOrder,
				langCode: dto.langCode,
				multiLang: true,
			});
		},

		approveReturnOrder: async (dto: RequestData<{ id: number; deliveryPaidByVendor: boolean }>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			if (!isAdmin) throw instance.httpErrors.badRequest("only admin can approve");
			const returnOrder = await privateMethods.findOne({
				id: dto.data.id,
				status: ReturnOrderRequestStatusEnum.PendingAdmin,
			});
			const orderService = OrdersService(instance);
			const order = await orderService.findOrderById({
				id: returnOrder.get("orderId"),
				throwError: true,
				isAdmin,
			});
			await returnOrder.update({
				status: ReturnOrderRequestStatusEnum.Approved,
				tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[2], loggedAt: new Date() }],
				deliveryPaidByVendor: dto.data.deliveryPaidByVendor,
			});
			const notificationService = NotificationService(instance);

			await notificationService.sendSpecificNotification({
				type: INotificationType.ReturnOrderStatus,
				params: [
					{
						en: returnOrder.orderId.toString(),
						ar: returnOrder.orderId.toString(),
					},
					{
						en: returnOrderStatus[ReturnOrderRequestStatusEnum.Approved].en,
						ar: returnOrderStatus[ReturnOrderRequestStatusEnum.Approved].ar,
					},
				],
				userIds: [returnOrder.userId],
				data: {
					returnOrderId: returnOrder.id,
				},
			});
			const newReturnOrder = await service.findById({
				id: returnOrder.get("id"),
				throwError: true,
			});
			return returnOrderRequestResponse({
				returnReq: newReturnOrder!,
				langCode: dto.langCode,
				multiLang: true,
			});
		},

		rejectReturnOrder: async (dto: RequestData<number>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			if (!isAdmin) throw instance.httpErrors.badRequest("only admin can reject");
			const returnOrder = await privateMethods.findOne({
				id: dto.data,
				status: ReturnOrderRequestStatusEnum.PendingAdmin,
			});
			const newTracking = returnOrder.tracking;

			await returnOrder.update({
				status: ReturnOrderRequestStatusEnum.Rejected,
				tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[6], loggedAt: new Date() }],
			});
			const newReturnOrder = await service.findById({
				id: returnOrder.id,
				throwError: true,
			});
			const notificationService = NotificationService(instance);

			await notificationService.sendSpecificNotification({
				type: INotificationType.ReturnOrderStatus,
				params: [
					{
						en: returnOrder.orderId.toString(),
						ar: returnOrder.orderId.toString(),
					},
					{
						en: returnOrderStatus[ReturnOrderRequestStatusEnum.Rejected].en,
						ar: returnOrderStatus[ReturnOrderRequestStatusEnum.Rejected].ar,
					},
				],
				userIds: [returnOrder.userId],
				data: {
					returnOrderId: returnOrder.id,
				},
			});
			return returnOrderRequestResponse({
				returnReq: newReturnOrder!,
				langCode: dto.langCode,
				multiLang: true,
			});
		},

		pickupReturnOrder: async (dto: RequestData<number>) => {
			const returnOrder = await privateMethods.findOne({
				id: dto.data,
				status: ReturnOrderRequestStatusEnum.Approved,
			});
			await returnOrder.update({
				status: ReturnOrderRequestStatusEnum.PickUp,
				tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[3], loggedAt: new Date() }],
			});

			const newReturnOrder = await service.findById({
				id: returnOrder.get("id"),
				throwError: true,
			});
			const notificationService = NotificationService(instance);

			await notificationService.sendSpecificNotification({
				type: INotificationType.ReturnOrderStatus,
				params: [
					{
						en: returnOrder.orderId.toString(),
						ar: returnOrder.orderId.toString(),
					},
					{
						en: returnOrderStatus[ReturnOrderRequestStatusEnum.PickUp].en,
						ar: returnOrderStatus[ReturnOrderRequestStatusEnum.PickUp].ar,
					},
				],
				userIds: [returnOrder.userId],
				data: {
					returnOrderId: returnOrder.id,
				},
			});
			return returnOrderRequestResponse({
				returnReq: newReturnOrder!,
				langCode: dto.langCode,
				multiLang: true,
			});
		},

		requestDriver: async (dto: RequestData<number>) => {
			const returnOrder = await privateMethods.findOne({
				id: dto.data,
				status: ReturnOrderRequestStatusEnum.Approved,
			});
			const data = await service.registerOrder(returnOrder);
			await returnOrder.update({
				status: ReturnOrderRequestStatusEnum.PickUp,
				tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[3], loggedAt: new Date() }],
				taskId: data.task_id,
				deliveryId: data.order_id,
			});

			return "Driver Requested";
		},

		addVendorData: async (dto: RequestData<{ id: number; vendorReason: string; vendorImages: string[] }>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			const returnOrder = await privateMethods.findOne({
				id: dto.data.id,
				status: ReturnOrderRequestStatusEnum.Pending,
			});
			const orderService = OrdersService(instance);
			const order = await orderService.findOrderById({
				id: returnOrder.get("orderId"),
				throwError: true,
				isAdmin,
			});
			await returnOrder.update({
				...dto.data,
				status: ReturnOrderRequestStatusEnum.PendingAdmin,
				tracking: [...returnOrder.tracking, { ...ReturnOrderStatusData[1], loggedAt: new Date() }],
			});
			const notificationService = NotificationService(instance);

			await notificationService.sendSpecificNotification({
				type: INotificationType.VendorReplied,
				params: [
					{
						en: returnOrder.orderId.toString(),
						ar: returnOrder.orderId.toString(),
					},
				],
				userIds: [returnOrder.userId],
				data: {
					returnOrderId: returnOrder.id,
				},
			});
			const newReturnOrder = await service.findById({
				id: returnOrder.get("id"),
				throwError: true,
			});
			return returnOrderRequestResponse({
				returnReq: newReturnOrder!,
				langCode: dto.langCode,
				multiLang: true,
			});
		},

		// findPendingRequestByOrderId: async (data: { orderId: number; transaction?: Transaction; throwError?: boolean }) => {
		// 	const { orderId, throwError = false, transaction } = data;
		// 	const options: FindOptions<ReturnOrderRequest> = {
		// 		transaction,
		// 		include: [Order],
		// 		where: { orderId, status: ReturnOrderRequestStatusEnum.PENDING },
		// 	};
		// 	const returnReq = await ReturnOrderRequest.findOne(options);
		// 	if (!returnReq && throwError) throw instance.httpErrors.notFound("orderReturnReq.response.notFound");
		// 	return returnReq;
		// },

		// returnOrder: async (data: { orderId: number; transaction?: Transaction }) => {
		// 	const { orderId, transaction } = data;
		// 	const orderService = OrdersService(instance);
		// 	const order = (await orderService.findOrderById({
		// 		id: orderId,
		// 		onlyItems: true,
		// 		throwError: true,
		// 	})) as Order;

		// 	if (!order.get("canBeReturned")) {
		// 		throw instance.httpErrors.badRequest("order.response.cannotReturn");
		// 	}

		// 	await order.update({ status: OrderStatusEnum.RETURNLED }, { transaction });

		// 	// re-adding the deducted amount from skus quantity
		// 	await Promise.all(
		// 		order.get("items").map(async (item) => {
		// 			const sku = item.get("sku");
		// 			await sku.increment("amount", {
		// 				by: item.get("quantity"),
		// 				transaction,
		// 			});
		// 			return true;
		// 		})
		// 	);
		// 	return true;
		// },

		findAll: async (dto: PaginatedRequest<IGetReturnOrderRequestsQueryDto>) => {
			const { limit, offset } = dto;
			const query = dto.data as IGetReturnOrderRequestsQueryDto;
			const isAdmin = dto.request.permission.isAdmin || false;
			const reqUser = dto.request?.user;

			if (reqUser?.role === UserTypeEnum.VENDOR) query.vendorId = reqUser.id;
			if (reqUser?.role === UserTypeEnum.USER) query.userId = reqUser.id;

			const { count, rows } = await ReturnOrder.findAndCountAll({
				where: privateMethods.filterReturnRequests(query),
				include: [
					{
						model: ReturnOrderItems,
						include: [{ model: SKU, include: [CustomAttributes, Product] }],
					},
					User,
					UserAddress,
					Admin,
					{ model: Order, include: [Location, OrderItem] },
				],
				limit,
				offset,
				order: orderCriteria({}),
			});
			const response = {
				count,
				rows: rows.map((returnReq: ReturnOrder) =>
					returnOrderRequestResponse({
						returnReq,
						langCode: dto.langCode,
						multiLang: isAdmin,
					})
				),
			};
			return response;
		},

		// approveOrReject: async (transaction: Transaction, dto: RequestData<IApproveOrRejectRequest>) => {
		// 	const { returnReqId, action } = dto.data;
		// 	const reqUser = dto.request!.user;
		// 	const returnReq = (await service.findById({
		// 		id: returnReqId,
		// 		throwError: true,
		// 	})) as ReturnOrderRequest;

		// 	// Doing validations
		// 	{
		// 		if (reqUser?.role !== UserTypeEnum.VENDOR || returnReq.get("vendorId") !== reqUser.id) {
		// 			throw instance.httpErrors.forbidden("returnOrderReq.response.onlyVendorCanApproveOrReject");
		// 		}

		// 		if (returnReq.get("status") !== ReturnOrderRequestStatusEnum.PENDING) {
		// 			throw instance.httpErrors.badRequest("returnOrderReq.response.cannotChangeStatus");
		// 		}
		// 	}

		// 	// Doing refunds and deductions
		// 	{
		// 		if (action === "approve") {
		// 			// Handling the wallet refund
		// 			{
		// 				const walletsService = WalletService(instance);
		// 				const userWallet = await walletsService.findOrCreateForUser({
		// 					userId: reqUser.id,
		// 					fullInfo: true,
		// 				});

		// 				const oldBalance = parseFloat(userWallet.get("balance"));
		// 				const newBalance = oldBalance + returnReq.get("order").get("grossTotal");

		// 				await userWallet.update({ balance: newBalance }, { transaction });
		// 			}

		// 			// Handling the accounting record
		// 			{
		// 				const accountingService = AccountingService(instance);
		// 				const adminsService = AdminService(instance);
		// 				const vendor = await adminsService.findVendorById(returnReq.get("vendorId"));

		// 				await accountingService.addAccounting(
		// 					{
		// 						orderId: returnReq.get("orderId"),
		// 						vendorId: returnReq.get("vendorId"),
		// 						status: AccountingStatus.out,
		// 						amount: (vendor.get("appPercentage") * returnReq.get("order").get("grossTotal")) / 100.0,
		// 					},
		// 					transaction
		// 				);
		// 			}
		// 			// Returning the main order
		// 			await service.returnOrder({
		// 				orderId: returnReq.get("orderId"),
		// 				transaction,
		// 			});
		// 		}
		// 	}

		// 	// Updating the req status
		// 	await returnReq.update(
		// 		{
		// 			status: action === "approve" ? ReturnOrderRequestStatusEnum.APPROVED : ReturnOrderRequestStatusEnum.REJECTED,
		// 		},
		// 		{ transaction }
		// 	);

		// 	const response = returnOrderRequestResponse({
		// 		returnReq,
		// 		langCode: dto.langCode,
		// 		multiLang: false,
		// 	});
		// 	return response;
		// },

		createReturnOrderRequest: async (transaction: Transaction, dto: RequestData<ICreateReturnOrderRequest>) => {
			const { orderId } = dto.data;
			const orderService = OrdersService(instance);
			const order =
				dto.request?.user.role === UserTypeEnum.ADMIN
					? ((await orderService.findOrderById({
							id: orderId,
							fullInfo: true,
							onlyItems: true,
							throwError: true,
							isAdmin: true,
					  })) as Order)
					: ((await orderService.findMyOrderById({
							id: orderId,
							userId: dto.request!.user.id as number,
							fullInfo: true,
					  })) as Order);
			// await instance.authorizeUserResource(order, userId);

			// Doing validations

			if (!order.get("canBeReturned")) {
				throw instance.httpErrors.badRequest("order.response.cannotReturn");
			}

			//validate user return order
			const userAddress = UserAddressService(instance);

			await userAddress.findMyAddress(dto.data.userAddressId, order.userId);

			// validating the productId and the quantity
			const skuMap = new Map<number, { quantity: number; price: number; skuData: object }>();
			const productMap = new Map<
				number,
				{ quantity: number; price: number; length?: object; size: object; color: object; productData: object }
			>();
			for (const item of order.items) {
				if (item.skuId)
					skuMap.set(item.skuId, {
						quantity: item.quantity,
						price: item.totalPrice / item.quantity - item.totalDiscount / item.quantity,
						skuData: item.skuData,
					});
				if (item.productId)
					productMap.set(item.productId, {
						quantity: item.quantity,
						price: item.totalPrice / item.quantity - item.totalDiscount / item.quantity,
						length: item.length,
						size: item.size,
						color: item.color,
						productData: item.productData,
					});
			}
			console.log(dto.data);
			const skus: { id: number; price: number; quantity: number; skuData: object }[] = [];
			const products: {
				id: number;
				price: number;
				quantity: number;
				length?: object;
				size: object;
				color: object;
				productData: object;
			}[] = [];
			let totalPrice = 0;
			for (const product of dto.data.products) {
				let orderedQuantity: any = { price: 0, quantity: 0 };
				if (product.skuId) {
					if (!skuMap.has(product.skuId)) {
						throw instance.httpErrors.badRequest("order.response.notInOrder");
					}

					orderedQuantity = skuMap.get(product.skuId)!;
					if (orderedQuantity.quantity < product.quantity) {
						throw instance.httpErrors.badRequest("order.response.notOrderedQuantity");
					}

					skus.push({
						id: product.skuId,
						quantity: product.quantity,
						price: orderedQuantity.price,
						skuData: orderedQuantity.skuData,
					});
				} else if (product.productId) {
					if (!productMap.has(product.productId)) {
						throw instance.httpErrors.badRequest("order.response.notInOrder");
					}

					orderedQuantity = productMap.get(product.productId)!;
					if (orderedQuantity.quantity < product.quantity) {
						throw instance.httpErrors.badRequest("order.response.notOrderedQuantity");
					}

					products.push({
						id: product.productId,
						quantity: product.quantity,
						price: orderedQuantity.price,
						productData: orderedQuantity.productData,
						length: orderedQuantity.length,
						size: orderedQuantity.size,
						color: orderedQuantity.color,
					});
				}
				totalPrice += product.quantity * orderedQuantity.price;
			}

			let delivery = 0;
			if (totalPrice === order?.finalPrice || 0 - order!.deliveryCost || 0) {
				delivery = order!.deliveryCost;
			}

			let returnOrderReq = await ReturnOrder.create(
				{
					userId: order.userId,
					orderId,
					userAddressId: dto.data.userAddressId,
					totalPrice: totalPrice + delivery,
					vendorId: order.get("vendorId"),
					returnReason: dto.data.returnReason,
					images: dto.data.images,
				},
				{ transaction }
			);
			const returnOrderItemsSkuData = skus.map((sku) => {
				return {
					skuId: sku.id,
					price: sku.price,
					totalPrice: sku.price * sku.quantity,
					quantity: sku.quantity,
					returnOrderId: returnOrderReq.id,
					skuData: sku.skuData,
				};
			});
			const returnOrderItemsProductData = products.map((product) => {
				return {
					productId: product.id,
					price: product.price,
					totalPrice: product.price * product.quantity,
					quantity: product.quantity,
					returnOrderId: returnOrderReq.id,
					productData: product.productData,
					color: product.color,
					size: product.size,
					length: product.length,
				};
			});

			const returnOrderItemsData = [...returnOrderItemsProductData, ...returnOrderItemsSkuData];

			await ReturnOrderItems.bulkCreate(returnOrderItemsData, { transaction });
			await order.update({ canBeReturned: false, returnOrderId: returnOrderReq.id }, { transaction });

			return returnOrderReq;
		},

		trackOrder: async (dto: RequestData<number>) => {
			const { request, data } = dto;
			const order = await service.findById({ id: data, throwError: true });
			if (!order!.deliveryId) {
				throw instance.httpErrors.badRequest();
			}
			const options = {
				method: "GET",
				url: `https://api.pass.qa/api/map-view/${order!.deliveryId}`,
				headers: {
					Accept: "application/json",
					//todo add bearer
					Authorization: `Bearer `,
					"Content-Type": "application/json",
				},
			};

			try {
				const response = await axios(options);
				return {
					data: response.data,
				};
			} catch (error: any) {
				console.log({
					data: error.response.data.data,
					error: error.response.data.data.errors,
				});

				console.error("Error:", error);
			}
		},

		registerOrder: async (order: ReturnOrder, config?: Configuration) => {
			let vendor = order.vendor;
			console.log(vendor);
			order.user.phoneNumber;
			const baseURL = "https://api.pass.qa/business";
			const options = {
				method: "POST",
				url: `${baseURL}/v1/orders`,
				headers: {
					Accept: "application/json",
					Authorization: `Bearer  ${instance.configs.delivery.key}`,
					"Content-Type": "application/json",
				},
				data: {
					addresses: {
						pickup: {
							lat: order.userAddress.lat,
							long: order.userAddress.lng,
							name: order.user.firstName,
							phone: order.user.phoneNumber,
							address: `Zone: ${order.userAddress.zone}, Street: ${order.userAddress.street}, , Building: ${order.userAddress.buildingInfo}, Unit: ${order.userAddress.unit}.`,
						},
						dropoffs: [
							{
								lat: vendor.address.latitude.toString(),
								long: vendor.address.longitude.toString(),
								name: vendor.vendorName.en,
								phone: "+974" + vendor.phoneNumber,
								address: `Zone: ${vendor.address.zone}, Street: ${vendor.address.street} , Building: ${vendor.address.building}, Unit: ${vendor.address.unit}.`,
							},
						],
					},
				},
			};
			try {
				const response = await axios(options);
				console.log({
					response,
				});

				console.log(response.data.data.order_id);
				let order_id = response.data.data.id;
				let task = response.data.data.dropoffs.find((d) => d.type == "dropoff");
				if (!task) throw instance.httpErrors.badRequest("TASK NOT FOUND");
				let task_id = task.task_id;
				return { order_id, task_id };
			} catch (error: any) {
				console.log({
					data: error.response.data.data,
					error: error.response.data.data.errors,
				});
				throw instance.httpErrors.badRequest();
			}
		},
	};
	return service;
};

export default ReturnOrderService;
