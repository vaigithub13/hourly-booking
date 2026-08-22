import { AdminRole } from "./../admin/utils/admin.enum";
import { FastifyInstance } from "fastify";
import { PaginatedRequest, RequestData, buildRequest } from "src/types/request";
import {
	ICreateOrderDto,
	IGetOrdersQuery,
	IRateOrder,
	IUpdateOrderStatusDto,
	IWebhook,
	OrderStatusEnum,
	PaymentMethodEnum,
	PaymentStatusEnum,
	getOrderStatusesRank,
	orderResponse,
	orderStatus,
	orderStatusesForTracking,
	passCompanyStatus,
} from "./order.dto";
import { FindOptions, Sequelize, Transaction } from "sequelize";
import { Cart, CartItem } from "../cart/cart.model";
import { Order } from "./order.model";
import { OrderItem } from "./order-item/order-item.model";
import { orderFetchedAttributes, orderIncludes } from "./utils/fetchables.";
import { OrderFilterService } from "./utils/order-filter-service";
import { orderCriteria, translateMessage } from "src/utils/common-methods";
import { JObject, UserTypeEnum } from "src/types/common-types";
import AttributeService from "../product/product.service";
import CancelOrderService from "./cancel-order.service";
import AccountingService from "../accounting/accounting.service";
import AdminService from "../admin/admin.service";
import { AccountingStatus } from "src/types/enums";
import WalletService from "../wallet/wallet.service";
import userAddress from "../user-address";
import { Configuration } from "../configuration/configuration.model";
import ConfigurationService from "../configuration/configuration.service";
import OrderTrackingService from "../order-tracking/order-tracking.service";
import { ReturnOrderRequestStatusEnum, returnOrderStatus, returnOrderStatusForTracking } from "./return-order.enum";
import NotificationService from "../notification/notification.service";
import { INotificationType } from "../notification/dto";
import { Location } from "../locations/locations.model";
import { EmailTitleEnum } from "src/plugins/sendGrid/templates/interfaces";
import { EmailDescriptions, generateVendorOrderEmail } from "./utils/emails";
import user from "../user";
import { RefundTargetEnum } from "./cancel-order.dto";
import { User } from "../user/user.model";
import axios from "axios";
import orderTrackingService from "../order-tracking/order-tracking.service";
import { Product, SKU } from "../product/product.model";
import ReturnOrderService from "./return-order.service";
import { ConfigService } from "aws-sdk";

export const OrdersService = (instance: FastifyInstance) => {
	const privateMethods = {
		getMaxDeliveryDaysForOrder: (data: { cart: Cart }) => {
			let maxEATDays = 0;
			const { cart } = data;
			for (const item of cart.get("items")) {
				const product = item.sku?.product || item.product;
				maxEATDays = Math.max(maxEATDays, product.get("etaDays") || 0);
			}
			return maxEATDays;
		},

		filterOrders: (query?: IGetOrdersQuery) => {
			if (!query) return undefined;
			const filters = new OrderFilterService();
			const { locationId, status, userId, vendorId, isPaid } = query;
			if (status) filters.equals("status", status);
			if (locationId) filters.equals("locationId", locationId);
			if (userId) filters.equals("userId", userId);
			if (vendorId) filters.equals("vendorId", vendorId);
			if (isPaid !== undefined) filters.equals("isPaid", isPaid);
			return filters.build();
		},
	};

	const service = {
		findOrderById: async (data: {
			id: number;
			fullInfo?: boolean;
			onlyItems?: boolean;
			transaction?: Transaction;
			throwError?: boolean;
			isAdmin: boolean;
		}) => {
			const { id, fullInfo, transaction, throwError = true, onlyItems, isAdmin } = data;
			const options: FindOptions<Order> = { transaction };
			if (fullInfo) {
				options.include = orderIncludes({ all: true, isAdmin });
			} else if (onlyItems) {
				options.include = orderIncludes({ items: true, isAdmin });
			}
			const order = await Order.findByPk(id, options);
			if (!order && throwError) {
				throw instance.httpErrors.notFound("order.response.notFound");
			}
			return order;
		},
		findOrderByTaskId: async (data: {
			taskId: string;
			fullInfo?: boolean;
			onlyItems?: boolean;
			transaction?: Transaction;
			throwError?: boolean;
		}) => {
			const { taskId, fullInfo, transaction, throwError = true, onlyItems } = data;
			const options: FindOptions<Order> = { transaction };
			if (fullInfo) {
				options.include = orderIncludes({ all: true, isAdmin: true });
			} else if (onlyItems) {
				options.include = orderIncludes({ items: true, isAdmin: true });
			}
			const order = await Order.findOne({ where: { taskId }, include: options.include, transaction });
			if (!order && throwError) {
				throw instance.httpErrors.notFound("order.response.notFound");
			}
			return order;
		},

		findMyOrderById: async (data: {
			id: number;
			userId: number;
			fullInfo?: boolean;
			onlyItems?: boolean;
			transaction?: Transaction;
		}) => {
			const { id, userId, fullInfo, transaction, onlyItems } = data;
			const options: FindOptions<Order> = { transaction };
			if (fullInfo) {
				options.include = orderIncludes({ all: true, isAdmin: false });
			} else if (onlyItems) {
				options.include = orderIncludes({ items: true, isAdmin: false });
			}
			const order = await Order.findOne({ where: { id, userId }, ...options });
			if (!order) {
				throw instance.httpErrors.notFound("order.response.notFound");
			}
			return order;
		},

		getOneOrder: async (dto: RequestData<number>) => {
			const id = dto.data;
			const role = dto.request!.user.role;
			const isAdmin = dto.request?.permission.isAdmin || false;

			const order = (await service.findOrderById({
				id,
				fullInfo: true,
				throwError: true,
				isAdmin,
			})) as Order;

			if (role === UserTypeEnum.USER) await instance.authorizeUserResource(order, dto.request!.user.id);

			if (role === UserTypeEnum.VENDOR && order.get("vendorId") !== dto.request!.user.id)
				throw instance.httpErrors.forbidden("common.resource.notAllowed");

			const response = orderResponse({
				order,
				langCode: dto.langCode,
				multiLang: role === UserTypeEnum.ADMIN,
			});

			return response;
		},

		createOrder: async (data: {
			location: Location;
			cart: Cart;
			paymentStatus: PaymentStatusEnum;
			paymentMethod?: string;
			note?: string;
			transaction?: Transaction;
		}) => {
			const { cart, location, transaction, paymentStatus, paymentMethod } = data;
			if (cart.items.length === 0) {
				throw instance.httpErrors.badRequest("cart.response.empty");
			}
			let order = await Order.create(
				{
					status: OrderStatusEnum.PLACED,
					paymentMethod,
					userId: cart.get("userId"),
					locationId: location.get("id"),
					userAddressId: cart.get("userAddress").get("id"),
					deliveryCost: cart.get("deliveryCost"),
					paymentStatus,
					note: data.note,
					vendorId: cart.items[0]?.sku?.product?.vendorId || cart.items[0]?.product?.vendorId,
					estimatedDeliveryDays: privateMethods.getMaxDeliveryDaysForOrder({
						cart,
					}),
				},
				{ transaction }
			);
			const productService = AttributeService(instance);
			// Creating the items of the order & Subtracting the ordered quantity of each sku
			await Promise.all(
				cart.get("items").map(async (item: CartItem) => {
					let skuItem: SKU | null = null;
					let productData: Product | null = null;
					if (item.get("skuId")) {
						skuItem = await productService.findSkuById({
							id: item.get("skuId"),
							fullInfo: true,
						});
						// Subtracting the quantity from the sku
						if (skuItem.amount !== null)
							await skuItem.decrement("amount", {
								by: item.get("quantity"),
								transaction,
							});
						const product = await productService.getOneProduct(skuItem.productId);

						await product.increment("totalOrders", {
							by: 1,
							transaction,
						});
					} else {
						// then the product is not ready to wear
						productData = await productService.getProductById(item.productId);
					}
					// Creating the order item
					const createdItem = await OrderItem.create(
						{
							userId: cart.get("user").get("id"),
							orderId: order.get("id"),
							skuId: item.get("skuId"),
							productId: item.get("productId"),
							totalPrice: item.get("totalPrice"),
							totalDiscount: item.get("totalDiscount"),
							quantity: item.get("quantity"),
							skuData: skuItem?.get() || null,
							productData: productData?.get() || null,
							lengthId: item.lengthId,
							sizeId: item.sizeId,
							colorId: item.colorId,
						},
						{ transaction }
					);
					return createdItem;
				})
			);

			await order.reload({ transaction });
			const grossTotal = order.get("subTotal") + order.get("deliveryCost");
			const finalPrice = grossTotal - order.get("totalDiscount");
			await order.update(
				{
					grossTotal,
					finalPrice,
				},
				{ transaction }
			);
			order = (await service.findOrderById({
				id: order.get("id"),
				fullInfo: true,
				throwError: true,
				transaction,
				isAdmin: false,
			})) as Order;
			return order;
		},
		getStatus: (status: string) => {
			const passStatus = passCompanyStatus.find((s) => s.status == status);
			if (!passStatus) return -1;
			return orderStatusesForTracking.findIndex((s) => s.code == passStatus.code);
		},
		webhook: async (dto: RequestData<IWebhook>) => {
			const { address, description, eta, lat, lng, receiver_name, task_id, type, status } = dto.data;

			// Log webhook received
			console.log("instance.customLog", instance.customLog);
			await instance.customLog.info(`Order webhook received for task_id: ${task_id}`, {
				webhookType: "order_status_update",
				taskId: task_id,
				status,
				type,
				address,
				description,
				eta,
				coordinates: { lat, lng },
				receiverName: receiver_name,
				ipAddress: dto.request?.ip,
				userAgent: dto.request?.headers?.["user-agent"],
			});

			const order = await service.findOrderByTaskId({ taskId: task_id });
			const returnOrderService = ReturnOrderService(instance);
			const returnOrder = await returnOrderService.findByTaskId({ taskId: task_id });
			// const idx = orderStatus.findIndex(
			//   (el) => el.en == status
			// );
			if (order) {
				// Log order found
				await instance.customLog.info(`Order found for webhook task_id: ${task_id}`, {
					orderId: order.id,
					userId: order.userId,
					vendorId: order.vendorId,
					currentStatus: order.status,
					newStatus: status,
					taskId: task_id,
				});

				const idx = service.getStatus(status);
				if (idx > -1) {
					// Log status update processing
					await instance.customLog.info(`Processing order status update`, {
						orderId: order.id,
						oldStatus: order.status,
						newStatus: orderStatusesForTracking[idx].status,
						statusIndex: idx,
						taskId: task_id,
					});

					if (
						orderStatusesForTracking[idx].status === OrderStatusEnum.DELIVERED ||
						orderStatusesForTracking[idx].status === OrderStatusEnum.SHIPPED
					) {
						const orderTrackingService = OrderTrackingService(instance);
						await orderTrackingService.create({
							orderId: order!.id,
							status: orderStatusesForTracking[idx].status,
						});

						await order!.update({
							status: orderStatusesForTracking[idx].status,
						});

						// Log successful status update
						await instance.customLog.info(`Order status updated successfully`, {
							orderId: order.id,
							newStatus: orderStatusesForTracking[idx].status,
							taskId: task_id,
							userId: order.userId,
							vendorId: order.vendorId,
						});

						const notificationService = NotificationService(instance);

						await notificationService.sendSpecificNotification({
							type: INotificationType.OrderStatus,
							params: [
								{ en: order!.id.toString(), ar: order!.id.toString() },
								{
									en: orderStatus[orderStatusesForTracking[idx].status].en,
									ar: orderStatus[orderStatusesForTracking[idx].status].ar,
								},
							],

							userIds: [order!.userId],
							data: {
								id: order!.id,
							},
						});
						await notificationService.sendSpecificNotification({
							type: INotificationType.OrderStatus,
							params: [
								{ en: order!.id.toString(), ar: order!.id.toString() },
								{
									en: orderStatus[orderStatusesForTracking[idx].status].en,
									ar: orderStatus[orderStatusesForTracking[idx].status].ar,
								},
							],

							userIds: [order!.vendorId],
							data: {
								id: order!.id,
							},
						});
					}
				} else {
					// Log invalid status
					await instance.customLog.warn(`Invalid status received in webhook`, {
						orderId: order.id,
						receivedStatus: status,
						statusIndex: idx,
						taskId: task_id,
					});
				}
			} else if (returnOrder) {
				// Log return order found

				await instance.customLog.info(`Return order found for webhook task_id: ${task_id}`, {
					returnOrderId: returnOrder.id,
					userId: returnOrder.userId,
					vendorId: returnOrder.vendorId,
					currentStatus: returnOrder.status,
					newStatus: status,
					taskId: task_id,
				});

				const idx = returnOrderService.getStatus(status);
				if (idx > -1) {
					// Log return order status update processing
					await instance.customLog.info(`Processing return order status update`, {
						returnOrderId: returnOrder.id,
						oldStatus: returnOrder.status,
						newStatus: returnOrderStatusForTracking[idx].status,
						statusIndex: idx,
						taskId: task_id,
					});

					if (
						returnOrderStatusForTracking[idx].status === ReturnOrderRequestStatusEnum.Complete ||
						returnOrderStatusForTracking[idx].status === ReturnOrderRequestStatusEnum.OnTheWay
					) {
						if (returnOrderStatusForTracking[idx].status === ReturnOrderRequestStatusEnum.Complete)
							await returnOrderService.completeReturnOrder({
								data: returnOrder.id,
								langCode: dto.langCode,
								request: dto.request,
							});
						else {
							await returnOrder!.update({
								status: returnOrderStatusForTracking[idx].status,
								tracking: [...returnOrder!.tracking, { ...returnOrderStatusForTracking[idx], loggedAt: new Date() }],
							});
							const notificationService = NotificationService(instance);

							await notificationService.sendSpecificNotification({
								type: INotificationType.ReturnOrderStatus,
								params: [
									{ en: returnOrder!.id.toString(), ar: returnOrder!.id.toString() },
									{
										en: returnOrderStatus[returnOrderStatusForTracking[idx].status].en,
										ar: returnOrderStatus[returnOrderStatusForTracking[idx].status].ar,
									},
								],

								userIds: [returnOrder!.userId],
								data: {
									id: returnOrder!.id,
								},
							});
							await notificationService.sendSpecificNotification({
								type: INotificationType.ReturnOrderStatus,
								params: [
									{ en: returnOrder!.id.toString(), ar: returnOrder!.id.toString() },
									{
										en: returnOrderStatus[returnOrderStatusForTracking[idx].status].en,
										ar: returnOrderStatus[returnOrderStatusForTracking[idx].status].ar,
									},
								],
								userIds: [returnOrder!.vendorId],
								data: {
									id: returnOrder!.id,
								},
							});
						}

						// Log successful return order status update
						await instance.customLog.info(`Return order status updated successfully`, {
							returnOrderId: returnOrder.id,
							newStatus: returnOrderStatusForTracking[idx].status,
							taskId: task_id,
							userId: returnOrder.userId,
							vendorId: returnOrder.vendorId,
						});
					} else {
						// Log invalid return order status
						await instance.customLog.warn(`Invalid status received for return order webhook`, {
							returnOrderId: returnOrder.id,
							receivedStatus: status,
							statusIndex: idx,
							taskId: task_id,
						});
					}
				}
			} else {
				// Log no order or return order found
				await instance.customLog.warn(`No order or return order found for webhook task_id: ${task_id}`, {
					taskId: task_id,
					status,
					type,
					ipAddress: dto.request?.ip,
					userAgent: dto.request?.headers?.["user-agent"],
				});
			}

			// Log webhook completion
			await instance.customLog.info(`Order webhook processing completed for task_id: ${task_id}`, {
				taskId: task_id,
				status,
				processed: true,
			});

			return true;
		},

		rateOrder: async (transaction: Transaction, dto: RequestData<IRateOrder>) => {
			const order = await service.findMyOrderById({
				id: dto.data.id,
				userId: dto.request?.user.id!,
			});

			if (order.get("status") !== OrderStatusEnum.DELIVERED) {
				throw instance.httpErrors.badRequest("order.response.notDelivered");
			}
			if (order.get("isRated")) {
				throw instance.httpErrors.badRequest("order.response.rated");
			}

			const adminService = AdminService(instance);
			const vendor = await adminService.findVendorById(order.get("vendorId"));

			const newTotalRate = vendor.get("totalRates") + dto.data.rate;
			const newRateCount = vendor.get("rateCount") + 1;
			const newRate = newTotalRate / newRateCount;

			await vendor.update({ rate: newRate, rateCount: newRateCount, totalRate: newTotalRate }, { transaction });
			await order.update({ isRated: true, rate: dto.data.rate }, { transaction });
			const newOrder = await service.findOrderById({
				id: dto.data.id,
				throwError: true,
				fullInfo: true,
				isAdmin: false,
			});
			const response = orderResponse({
				order: newOrder!,
				langCode: dto.langCode,
				multiLang: false,
			});
			return response;
		},

		findAllOrders: async (dto: PaginatedRequest<IGetOrdersQuery>) => {
			const { langCode, limit, offset } = dto;
			const role = dto.request.user.role;
			const isAdmin = dto.request.permission.isAdmin || false;

			// If user then send only the orders of this user
			if (role === UserTypeEnum.USER && dto.data) {
				dto.data.userId = dto.request.user.id;
			}
			// If vendor then send only the orders of users of that vendor
			if (role === UserTypeEnum.VENDOR && dto.data) {
				dto.data.vendorId = dto.request.user.id;
			}

			const { count, rows } = await Order.findAndCountAll({
				where: privateMethods.filterOrders(dto.data),
				include: orderIncludes({
					location: true,
					user: true,
					vendor: true,
					accounting: true,
					isAdmin,
				}),
				attributes: [
					...orderFetchedAttributes.findAllOrders(),
					[
						Sequelize.literal(`(
          SELECT COUNT(id)
          FROM orders_items AS oi
          WHERE oi."orderId" = "Order"."id"
        )`),
						"itemsCount",
					],
					[
						Sequelize.literal(`(
          SELECT SUM(quantity)
          FROM orders_items AS oi
          WHERE oi."orderId" = "Order"."id"
        )`),
						"totalItemsQuantity",
					],
				],
				limit,
				offset,
				order: orderCriteria({}),
				paranoid: !isAdmin,
			});
			return {
				count,
				rows: rows.map((order) =>
					orderResponse({
						order,
						langCode,
						multiLang: role === UserTypeEnum.ADMIN,
					})
				),
			};
		},

		findOrderMetaData: async () => {
			const result = {
				orderStatusEnum: Object.values(OrderStatusEnum).map((value, index) => ({
					id: index + 1,
					status: value as OrderStatusEnum,
				})),
				paymentStatusEnum: Object.values(PaymentStatusEnum),
				returnOrderStatusEnum: Object.values(ReturnOrderRequestStatusEnum),
				refundTargetEnum: Object.values(RefundTargetEnum).filter((refund) => refund !== RefundTargetEnum.PENDING),
			};
			return result;
		},

		updateOrderStatus: async (transaction: Transaction, dto: RequestData<IUpdateOrderStatusDto>) => {
			const { data, langCode } = dto;
			let order = (await service.findOrderById({
				id: data.id,
				fullInfo: true,
				throwError: true,
				isAdmin: true,
			})) as Order;

			// Doing validation
			{
				if (!order.get("canBeCanceled") && data.newStatus === OrderStatusEnum.CANCELLED) {
					throw instance.httpErrors.badRequest("order.response.cannotCancel");
				}
			}
			if (dto.request?.user.role === UserTypeEnum.VENDOR && order.get("vendorId") !== dto.request?.user.id) {
				throw instance.httpErrors.forbidden("common.resource.notAllowed");
			}

			const orderStatusesRanks = getOrderStatusesRank();
			if (orderStatusesRanks[data.newStatus] < orderStatusesRanks[order.get("status")]) {
				throw instance.httpErrors.badRequest("order.response.cannotChangeStatusBack");
			}

			// Handling order tracking records
			{
				const orderTrackingService = OrderTrackingService(instance);
				await orderTrackingService.create({
					orderId: order.get("id"),
					status: data.newStatus,
					transaction,
				});
			}

			await order.update(
				{
					status: data.newStatus,
					canBeCanceled: data.newStatus === OrderStatusEnum.PLACED,
					canBeReturned: data.newStatus === OrderStatusEnum.DELIVERED,
				},
				{ transaction }
			);

			if (data.newStatus === OrderStatusEnum.ReadyToShip) {
				const globalConfigService = ConfigurationService(instance);
				const globalConfig = await globalConfigService.find();
				const data = await service.registerOrder(order, globalConfig);
				await order.update({ taskId: data.task_id, deliveryId: data.order_id, deliveryCost: data.price }, { transaction });
			}

			const response = orderResponse({ order, langCode, multiLang: false });
			return response;
		},
		revertPickupStatus: async (transaction: Transaction, dto: RequestData<{ id: number }>) => {
			const { data, langCode } = dto;
			let order = (await service.findOrderById({
				id: data.id,
				fullInfo: true,
				throwError: true,
				isAdmin: true,
			})) as Order;

			if (order.status !== OrderStatusEnum.ReadyToShip) {
				throw instance.httpErrors.badRequest("order.response.cannotChangeStatusBack");
			}

			// Handling order tracking records
			{
				const orderTrackingService = OrderTrackingService(instance);
				await orderTrackingService.delete({
					orderId: order.get("id"),
					status: OrderStatusEnum.ReadyToShip,
					transaction,
				});
			}

			await order.update(
				{
					status: OrderStatusEnum.CONFIRMED,
				},
				{ transaction }
			);

			const response = orderResponse({ order, langCode, multiLang: false });
			return response;
		},

		sendEmailsUponOrderCreation: async (data: { order: Order; langCode: string }) => {
			const { langCode, order } = data;
			// 1
			service.sendOrderEmailForUser({
				emailDescription: EmailDescriptions.OrderConfirmation,
				emailTitle: EmailTitleEnum.ORDER_CONFIRMATION,
				order,
				langCode,
			});

			// 2
			service.sendVendorEmailOnNewOrder({
				order,
			});
			return true;
		},

		sendVendorEmailOnNewOrder: async (data: { order: Order }) => {
			const { order } = data;
			const vendorEmail = await order.get("vendor").get("email");
			if (!vendorEmail) return;
			await instance.sendCustomEmail({
				emailAddress: vendorEmail,
				subject: "New Order",
				htmlTemplate: generateVendorOrderEmail({
					orderId: order.get("id").toString(),
					userName: order.get("user").get("firstName") || order.get("user").get("phoneNumber"),
					orderLink: instance.configs.instance.feHost + `/dashboard/vendor/orders/${order.get("id")}/details`,
				}),
			});
			return true;
		},

		sendOrderEmailForUser: async (data: { order: Order; emailTitle: EmailTitleEnum; emailDescription: string; langCode?: string }) => {
			const { order, emailTitle, emailDescription, langCode = "en" } = data;
			const userEmail = order.get("user").get("email");
			if (!userEmail) return;
			const { orderDetailsTemplateId, sender } = instance.configs.sendGrid;
			await instance.sendEmailUsingTemplate({
				dynamicTemplateData: {
					emailTitle,
					emailDescription,
					orderId: order.get("id").toString(),
					paymentMethod: order.get("paymentMethod"),
					items: order.get("items").map((item) => {
						const { mainImage, name } = item.sku?.product || item.product;
						return {
							image: mainImage,
							price: Math.floor(item.get("totalPrice") / item.get("quantity")),
							quantity: item.get("quantity"),
							text: name[langCode],
						};
					}),
					shippingCost: order.get("deliveryCost"),
					subtotal: order.get("finalPrice") - order.get("deliveryCost"),
					userName: `${order.get("user").get("firstName")} ${order.get("user").get("lastName")}`,
				},
				templateId: orderDetailsTemplateId,
				from: sender,
				subject: emailTitle,
				to: userEmail,
			});
		},

		sendOrderRefundNotification: async (data: { orderId: number }) => {
			const { orderId } = data;
			const order = await Order.findByPk(orderId, { include: [User] });
			if (!order) throw instance.httpErrors.notFound("order.response.notFound");
			const userDeviceId = order.get("user").get("deviceId");
			if (!userDeviceId) return;
			await instance.sendNotification({
				contents: {
					en: `Order #${order.get("id")} has been successfully refunded to ${order.get("paymentMethod")}!`,
					ar: `تم إرجاع قيمة الطلب ${order.get("id")} إلى ${order.get("paymentMethod")}`,
				},
				headings: { en: `Order refund`, ar: `استرداد دفع طلب` },
				devicesIds: [userDeviceId],
			});
		},
		trackOrder: async (dto: RequestData<number>) => {
			const { request, data } = dto;
			const order = await service.findOrderById({ id: data, fullInfo: true, isAdmin: true, throwError: true });
			if (!order!.deliveryId) {
				throw instance.httpErrors.badRequest();
			}
			const options = {
				method: "GET",
				url: `https://api.pass.qa/api/map-view/${order!.deliveryId}`,
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${instance.configs.delivery.key}`,
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

		registerOrder: async (order: Order, globalConfig: Configuration) => {
			let vendor = order.vendor;
			order.user.phoneNumber;
			const baseURL = "https://api.pass.qa/business";
			const options = {
				method: "POST",
				url: `${baseURL}/v1/orders`,
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${instance.configs.delivery.key}`,
					"Content-Type": "application/json",
				},
				data: {
					addresses: {
						pickup: {
							lat: vendor.address.latitude.toString(),
							long: vendor.address.longitude.toString(),
							name: vendor.vendorName.en,
							phone: "+91" + vendor.phoneNumber,
							address: `Zone: ${vendor.address.zone}, Street: ${vendor.address.street}, Building: ${vendor.address.building}, Unit: ${vendor.address.unit}.`,
						},
						dropoffs: [
							{
								lat: order.userAddress.lat,
								long: order.userAddress.lng,
								name: order.user.firstName,
								phone: order.user.phoneNumber,
								address: `Zone: ${order.userAddress.zone}, Street: ${order.userAddress.street}, Building: ${vendor.address.building}, Unit: ${vendor.address.unit}.`,
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

				let order_id = response.data.data.id;
				let task = response.data.data.dropoffs.find((d) => d.type == "dropoff");
				if (!task) throw instance.httpErrors.badRequest("TASK NOT FOUND");
				let task_id = task.task_id;
				const price = globalConfig.deliveryPricing.insideDoha;
				return { order_id, task_id, price };
			} catch (error: any) {
				console.log({
					data: error.response.data.data,
					error: error.response.data.data.errors,
				});
				throw instance.httpErrors.badRequest(error.response.data.data);
			}
		},
	};
	return service;
};

export default OrdersService;
