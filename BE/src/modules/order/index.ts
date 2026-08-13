import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import * as schema from "./order.schema";
import { OrdersService } from "./order.service";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";
import { withTransaction } from "src/utils/sequelize";
import { buildPaginationRequest, buildRequest } from "src/types/request";
import LocationsService from "../locations/locations.service";
import UserService from "../user/user.service";
import CartService from "../cart/cart.service";
import CancelOrderService from "./cancel-order.service";
import ReturnOrderService from "./return-order.service";
import UserAddressService from "../user-address/user-address.service";
import OrderTrackingService from "../order-tracking/order-tracking.service";
import { orderResponse, orderStatus, OrderStatusEnum, PaymentMethodEnum, PaymentStatusEnum } from "./order.dto";
import { CancelOrderRequest, Order } from "./order.model";
import WalletService from "../wallet/wallet.service";
import PaymentService from "../payment/payment.service";
import { EmailDescriptions } from "./utils/emails";
import { EmailTitleEnum } from "src/plugins/sendGrid/templates/interfaces";
import VendorService from "../vendor/vendor.service";
import NotificationService from "../notification/notification.service";
import { INotificationType } from "../notification/dto";
import AccountingService from "../accounting/accounting.service";
import AdminService from "../admin/admin.service";
import { AccountingStatus } from "src/types/enums";
import { cancelOrderRequestResponse, RefundTargetEnum } from "./cancel-order.dto";
import { Admin } from "../admin/admin.model";
import { UserTypeEnum } from "src/types/common-types";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const ordersService = OrdersService(fastify);
	const cancelOrderService = CancelOrderService(fastify);
	const returnOrderService = ReturnOrderService(fastify);

	instance.post(
		"/place",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.placeOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.placeOrder>) => {
			const langCode = request.headers["x-lang"];
			const { payWithWallet } = request.body;

			const usersService = UserService(fastify);
			const user = await usersService.findById({
				id: request.user.id,
				fullInfo: true,
			});

			const locationsService = LocationsService(fastify);
			const location = await locationsService.findLocation(request.body.locationId);

			const transaction = await instance.db.transaction();
			try {
				const cartsService = CartService(fastify);
				const cart = await cartsService.findOrCreateForUser({
					userId: user.get("id"),
					fullInfo: true,
					transaction,
				});

				const walletService = WalletService(fastify);
				const wallet = await walletService.findOrCreateForUser({
					userId: user.get("id"),
					transaction,
				});

				if (payWithWallet && +wallet.get("balance") >= cart.get("finalPrice")) {
					// Here it means the final price of the cart will be paid all using wallet
					const createdOrder = await ordersService.createOrder({
						cart,
						location,
						paymentStatus: PaymentStatusEnum.COMPLETED,
						note: request.body.note,
						transaction,
					});

					// Handling order tracking records
					{
						const orderTrackingService = OrderTrackingService(fastify);
						await orderTrackingService.create({
							orderId: createdOrder.get("id"),
							status: OrderStatusEnum.PLACED,
							transaction,
						});
					}

					// Updating the wallet balance
					await walletService.updateBalance(cart.get("userId"), -cart.get("finalPrice"), transaction);
					await createdOrder.update(
						{
							walletPaidAmount: cart.get("finalPrice"),
							paymentMethod: PaymentMethodEnum.WALLET,
						},
						{ transaction }
					);

					await cartsService.clearCart({ cart, transaction });
					const response = orderResponse({
						order: createdOrder,
						langCode,
						multiLang: false,
					});

					try {
						ordersService.sendEmailsUponOrderCreation({
							langCode: request.headers["x-lang"],
							order: createdOrder,
						});
					} catch (err) {
						console.log(err);
					}

					//Handling accounting records adding
					{
						const accountingService = AccountingService(instance);
						const adminsService = AdminService(instance);
						const vendor = await adminsService.findVendorById(createdOrder.get("vendorId"));

						const netProductsPrice = +createdOrder.get("finalPrice") - +createdOrder.get("deliveryCost");

						await accountingService.addAccounting(
							{
								orderId: createdOrder.get("id"),
								vendorId: createdOrder.get("vendorId"),
								status: AccountingStatus.in,
								amount: ((100 - vendor.get("appPercentage")) * netProductsPrice) / 100.0,
							},
							transaction
						);
					}

					await transaction.commit();
					return response;
				} else {
					/*
            Now we will just create payment and send it to mobile app to use it.
            Check payment index.ts for more info
          */

					const paymentService = PaymentService(fastify);
					const toPayWithWallet = payWithWallet ? +wallet.get("balance") : 0;
					const toPayWithPG = cart.get("finalPrice") - (request.user.id === 52 ? 39 : 0) - toPayWithWallet;
					const payment = await paymentService.createPayment({
						user,
						transactionId: cart.get("id").toString(),
						amount: toPayWithPG,
						toPayWithWallet,
						locationId: location.get("id"),
					});
					const { uid, amount, paymentUrl, paymentId } = payment.get();
					await transaction.commit();
					return { uid, amount, paymentUrl, paymentId };
				}
			} catch (err) {
				await transaction.rollback();
				throw err;
			}
		}
	);

	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOrders,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOrders>) => {
			const langCode = request.headers["x-lang"];
			const { limit, offset } = request.query;
			const response = await ordersService.findAllOrders(buildPaginationRequest(limit, offset, langCode, request, request.query));
			return response;
		}
	);

	instance.get(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await ordersService.getOneOrder(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);

	instance.post(
		"/webhook",
		{
			schema: schema.updateOrderStatusWebhook,
		},
		async (request: FastifyRequestTypebox<typeof schema.updateOrderStatusWebhook>) => {
			const { headers } = request;
			const response = await ordersService.webhook(buildRequest(request.body, "", request));
			return response;
		}
	);

	instance.get(
		"/track/:id",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.trackOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.trackOrder>) => {
			const { headers } = request;
			const response = await ordersService.trackOrder(buildRequest(request.params.id, headers["x-lang"], request));
			return response;
		}
	);

	instance.get(
		"/return/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.getOneReturnOrderVendor(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);

	instance.patch(
		"/return/:id/approve",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.approveReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.approveReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.approveReturnOrder(
				buildRequest({ id: request.params.id, deliveryPaidByVendor: request.body.deliveryPaidByVendor }, langCode, request)
			);
			return response;
		}
	);

	instance.patch(
		"/return/:id/add-data-vendor",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.addReturnReasonsForVendor,
		},
		async (request: FastifyRequestTypebox<typeof schema.addReturnReasonsForVendor>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.addVendorData(
				buildRequest({ id: request.params.id, ...request.body }, langCode, request)
			);
			return response;
		}
	);

	instance.patch(
		"/return/:id/request-driver",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.requestDriver(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);

	instance.patch(
		"/return/:id/pick-up",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.pickupReturnOrder(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);

	instance.patch(
		"/return/:id/reject",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.rejectReturnOrder(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);

	instance.patch(
		"/return/:id/complete",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getOneReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.getOneReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.completeReturnOrder(buildRequest(request.params.id, langCode, request));
			return response;
		}
	);
	instance.patch(
		"/return/:id/change-refund-method",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.CompleteReturnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.CompleteReturnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await returnOrderService.refundReturnOrder(
				buildRequest(
					{
						id: request.params.id,
						refundTarget: request.body.refundTarget,
						amount: request.body.amount,
					},
					langCode,
					request
				)
			);
			return response;
		}
	);

	instance.get(
		"/return",
		{
			preValidation: instance.auth([instance.authenticate, instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getReturnOrdersRequests,
		},
		async (request: FastifyRequestTypebox<typeof schema.getReturnOrdersRequests>) => {
			const langCode = request.headers["x-lang"];
			const { limit, offset } = request.query;
			const response = await returnOrderService.findAll(buildPaginationRequest(limit, offset, langCode, request, request.query));
			return response;
		}
	);

	instance.patch(
		"/change-order-status/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.updateOrderStatus,
		},
		async (request: FastifyRequestTypebox<typeof schema.updateOrderStatus>) => {
			const langCode = request.headers["x-lang"];
			const order = (await ordersService.findOrderById({
				id: request.params.id,
				fullInfo: true,
				throwError: true,
				isAdmin: true,
			})) as Order;
			const dto = buildRequest({ id: request.params.id, newStatus: request.body.newStatus }, langCode, request);
			const { result: response } = await withTransaction(instance.db, ordersService.updateOrderStatus, dto);

			const userEmail = order.get("user").get("email");
			if (userEmail) {
				// Sending email to the user informing him that his order status has changed to X
				const newStatus = request.body.newStatus;
				try {
					await instance.sendUpdateOrderStatusEmail({
						email: userEmail,
						orderId: order.get("id").toString(),
						status: `${newStatus[0].toUpperCase()}${newStatus.substring(1).toLocaleLowerCase()}`,
					});
				} catch (err) {
					console.error(err);
				}
			}

			const notificationService = NotificationService(instance);

			try {
				// Sending app notification to the user informing him that his order status has changed to X
				await notificationService.sendSpecificNotification({
					type: INotificationType.OrderStatus,
					params: [
						{ en: order.id.toString(), ar: order.id.toString() },
						{
							en: orderStatus[request.body.newStatus].en,
							ar: orderStatus[request.body.newStatus].ar,
						},
					],
					userIds: [order.userId],
					data: {
						orderId: order.id,
					},
				});
			} catch (err) {
				console.error(err);
			}

			return response;
		}
	);
	instance.patch(
		"/revert-pickup-status/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.revertPickupStatus,
		},
		async (request: FastifyRequestTypebox<typeof schema.revertPickupStatus>) => {
			const langCode = request.headers["x-lang"];
			const order = (await ordersService.findOrderById({
				id: request.params.id,
				fullInfo: true,
				throwError: true,
				isAdmin: true,
			})) as Order;
			const dto = buildRequest({ id: request.params.id }, langCode, request);
			const { result: response } = await withTransaction(instance.db, ordersService.revertPickupStatus, dto);

			const userEmail = order.get("user").get("email");
			const newStatus = OrderStatusEnum.CONFIRMED;
			if (userEmail) {
				// Sending email to the user informing him that his order status has changed to X
				try {
					await instance.sendUpdateOrderStatusEmail({
						email: userEmail,
						orderId: order.get("id").toString(),
						status: `${newStatus[0].toUpperCase()}${newStatus.substring(1).toLocaleLowerCase()}`,
					});
				} catch (err) {
					console.error(err);
				}
			}

			const notificationService = NotificationService(instance);

			try {
				// Sending app notification to the user informing him that his order status has changed to X
				await notificationService.sendSpecificNotification({
					type: INotificationType.OrderStatus,
					params: [
						{ en: order.id.toString(), ar: order.id.toString() },
						{
							en: orderStatus[newStatus].en,
							ar: orderStatus[newStatus].ar,
						},
					],
					userIds: [order.userId],
					data: {
						orderId: order.id,
					},
				});
			} catch (err) {
				console.error(err);
			}

			return response;
		}
	);

	//* Cancelling orders APIs

	instance.post(
		"/cancel-order/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.createCancelOrderReq,
		},
		async (request: FastifyRequestTypebox<typeof schema.createCancelOrderReq>) => {
			const langCode = request.headers["x-lang"];
			const transaction = await instance.db.transaction();
			try {
				const response = await cancelOrderService.createCancelOrderRequest(
					transaction,
					buildRequest({ orderId: request.params.id }, langCode, request)
				);

				await transaction.commit();

				// Handling sending vendor email that user cancelled his order
				{
					const vendorsService = VendorService(instance);
					const usersService = UserService(instance);

					try {
						const user = await usersService.findById({ id: request.user.id });
						vendorsService.sendEmailForVendorOfOrderCancelOrReturn({
							user,
							orderId: request.params.id,
							action: "cancelled",
						});
					} catch (err) {
						console.error(err);
					}
				}
				return response;
			} catch (err) {
				await transaction.rollback();
				console.log(err);
				throw err;
			}
		}
	);

	// instance.patch(
	// 	"/set-refund-target/:cancelRequestId",
	// 	{
	// 		preValidation: instance.auth([instance.authenticate], {
	// 			relation: "and",
	// 		}),
	// 		schema: schema.setRefundTarget,
	// 	},
	// 	async (request: FastifyRequestTypebox<typeof schema.setRefundTarget>) => {
	// 		const langCode = request.headers["x-lang"];
	// 		const body = request.body;

	// 		if (
	// 			body.refundTarget === RefundTargetEnum.WALLET &&
	// 			(body.walletRefundValue === undefined || body.walletRefundValue === null)
	// 		) {
	// 			throw instance.httpErrors.badRequest("order.response.walletRefundedValueNotProvided");
	// 		}

	// 		const transaction = await instance.db.transaction();
	// 		try {
	// 			let cancelReq = (await cancelOrderService.findById({
	// 				id: request.params.cancelRequestId,
	// 				throwError: true,
	// 				transaction,
	// 			})) as CancelOrderRequest;
	// 			const order = cancelReq.get("order");

	// 			if (body.refundTarget === RefundTargetEnum.WALLET && body.walletRefundValue! > order.get("finalPrice")) {
	// 				throw instance.httpErrors.badRequest("order.response.maximumRefundValueExceeded");
	// 			}

	// 			cancelReq = await cancelOrderService.setRefundTarget(
	// 				transaction,
	// 				buildRequest(
	// 					{
	// 						cancelRequest: cancelReq,
	// 						refundTarget: body.refundTarget,
	// 					},
	// 					langCode,
	// 					request
	// 				)
	// 			);

	// 			if (body.refundTarget === RefundTargetEnum.WALLET) {
	// 				// Handling the wallet refund
	// 				const walletsService = WalletService(instance);
	// 				await walletsService.updateBalance(cancelReq.get("userId"), body.walletRefundValue as number, transaction);
	// 			}

	// 			// Handling the accounting record
	// 			{
	// 				const accountingService = AccountingService(instance);

	// 				const orderInAccounting = await accountingService.getAccountingByCriteria({
	// 					orderId: order.get("id"),
	// 					status: AccountingStatus.in,
	// 				});

	// 				await orderInAccounting.update({ amount: 0, isRefunded: true }, { transaction });
	// 			}

	// 			// Handling order trackings record
	// 			{
	// 				const orderTrackingService = OrderTrackingService(instance);
	// 				await orderTrackingService.create({
	// 					orderId: cancelReq.get("orderId"),
	// 					status: OrderStatusEnum.CANCELLED,
	// 					transaction,
	// 				});
	// 			}
	// 			const response = cancelOrderRequestResponse({
	// 				cancelReq,
	// 				langCode,
	// 				multiLang: true,
	// 			});
	// 			await transaction.commit();

	// 			// Notifying user that his order has been refunded
	// 			try {
	// 				await ordersService.sendOrderRefundNotification({
	// 					orderId: cancelReq.get("orderId"),
	// 				});
	// 			} catch (err) {
	// 				console.error(err);
	// 			}

	// 			return response;
	// 		} catch (err) {
	// 			await transaction.rollback();
	// 			console.log(err);
	// 			throw err;
	// 		}
	// 	}
	// );

	instance.post(
		"/cancel-order-by-admin/:id",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.createCancelOrderReq,
		},
		async (request: FastifyRequestTypebox<typeof schema.createCancelOrderReq>) => {
			const langCode = request.headers["x-lang"];
			const transaction = await instance.db.transaction();
			const order = (await ordersService.findOrderById({
				id: request.params.id,
				isAdmin: false,
				fullInfo: true,
				throwError: true,
			})) as Order; // We set admin to false because we don't need paranoid to be activated

			try {
				const response = await cancelOrderService.createCancelOrderRequest(
					transaction,
					buildRequest({ orderId: order.get("id") }, langCode, request)
				);

				await transaction.commit();

				// Handling sending vendor email that user cancelled his order
				{
					const vendorsService = VendorService(instance);
					try {
						vendorsService.sendEmailForVendorOfOrderCancelOrReturn({
							user: order.get("user"),
							orderId: request.params.id,
							action: "cancelled",
						});
					} catch (err) {
						console.error(err);
					}
				}
				return response;
			} catch (err) {
				await transaction.rollback();
				console.log(err);
				throw err;
			}
		}
	);

	instance.post(
		"/:id/return",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.returnOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.returnOrder>) => {
			const langCode = request.headers["x-lang"];
			const response = await withTransaction(
				instance.db,
				returnOrderService.createReturnOrderRequest,
				buildRequest({ orderId: request.params.id, ...request.body }, langCode, request)
			);
			// Handling sending vendor email that user cancelled his order
			{
				const vendorsService = VendorService(instance);
				const usersService = UserService(instance);

				try {
					if (request.user.role !== UserTypeEnum.ADMIN) {
						const user = await usersService.findById({ id: request.user.id });
						vendorsService.sendEmailForVendorOfOrderCancelOrReturn({
							user,
							orderId: request.params.id,
							action: "returned",
						});
					}
				} catch (err) {
					console.error(err);
				}
			}

			return response;
		}
	);

	instance.get(
		"/meta-data",
		{
			schema: schema.orderMetaData,
		},
		async (request: FastifyRequestTypebox<typeof schema.orderMetaData>) => {
			const response = await ordersService.findOrderMetaData();
			return response;
		}
	);

	instance.post(
		"/:id/rate",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.rateOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.rateOrder>) => {
			const langCode = request.headers["x-lang"];
			const { result: response } = await withTransaction(
				instance.db,
				ordersService.rateOrder,
				buildRequest({ id: request.params.id, ...request.body }, langCode, request)
			);
			return response;
		}
	);

	instance.get(
		"/cancel-orders-requests",
		{
			preValidation: instance.auth(
				[instance.authenticate], // authorizing admin in both roles
				{
					relation: "and",
				}
			),
			schema: schema.getCancelOrdersRequests,
		},
		async (request: FastifyRequestTypebox<typeof schema.getCancelOrdersRequests>) => {
			const langCode = request.headers["x-lang"];
			const { limit, offset } = request.query;
			const response = await cancelOrderService.findAll(buildPaginationRequest(limit, offset, langCode, request, request.query));
			return response;
		}
	);
};
