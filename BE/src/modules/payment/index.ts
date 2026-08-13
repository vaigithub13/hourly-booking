import { FastifyInstance } from "fastify";
import CartsService from "../cart/cart.service";
import PaymentService from "./payment.service";
import { IReturnURLQuery, ISCWebhookSentPayload } from "./payment.dto";
import { verifySkipCashWebhook } from "./utils/methods";
import OrdersService from "../order/order.service";
import { orderResponse, OrderStatusEnum, PaymentStatusEnum } from "../order/order.dto";
import AccountingService from "../accounting/accounting.service";
import { AccountingStatus } from "src/types/enums";
import AdminService from "../admin/admin.service";
import { Cart } from "../cart/cart.model";
import LocationsService from "../locations/locations.service";
import WalletService from "../wallet/wallet.service";
import OrderTrackingService from "../order-tracking/order-tracking.service";

/**
 * SkipCash Payment Flow:
 *
 * 1. The user initiates the checkout process by calling the endpoint: POST /orders/place.
 *
 * 2. If payment is required, we create a payment using the PaymentService.
 *    - This generates a payment URL and related metadata, which is returned to the frontend (mobile app).
 *    - The frontend redirects the user to SkipCash using the payment URL.
 *
 * 3. After the user completes the payment on SkipCash:
 *    - First, SkipCash calls our backend webhook endpoint: POST /payment/webhook
 *      - This is used to validate and update the payment status in our database.
 *
 * 4. Then, SkipCash redirects the user to our frontend via the return URL,
 *    which hits our backend at: GET /payment/redirect-url
 *    - This endpoint finalizes the order creation and related logic in our system.
 *    - It handles wallet balance updates, order creation, accounting records, email notifications, etc.
 *
 * Note:
 * - The webhook ensures we don't trust the frontend for payment status.
 * - The redirect-url endpoint allows us to complete the internal flow post-payment.
 */
export default async (instance: FastifyInstance) => {
	const paymentService = PaymentService(instance);

	/* Endpoint that the SkipCash payment gateway will call after the payment is done and the webhook is called */

	instance.get("/redirect-url", {}, async (request) => {
		const { id, statusId, status, transId, custom1 } = request.query as IReturnURLQuery;

		const payment = await paymentService.getPaymentDetails(id);
		if (!payment || (payment && payment.get("statusId") !== "2")) {
			throw instance.httpErrors.internalServerError("payment.response.failed");
		}

		const transaction = await instance.db.transaction();
		try {
			const cartsService = CartsService(instance);
			const cart = (await cartsService.findById({
				id: +payment.transactionId,
				throwError: true,
				fullInfo: true,
			})) as Cart;

			const locationsService = LocationsService(instance);
			const location = await locationsService.findLocation(payment.get("locationId"));

			// Subtracting the toPayWithWallet amount from the wallet
			const walletService = WalletService(instance);
			await walletService.updateBalance(cart.get("userId"), -payment.toPayWithWallet, transaction);

			// Handling order info updating
			const orderService = OrdersService(instance);
			const order = await orderService.createOrder({
				cart,
				location,
				paymentStatus: PaymentStatusEnum.COMPLETED,
				paymentMethod: payment.cardType,
				transaction,
			});

			await order.update(
				{
					walletPaidAmount: payment.toPayWithWallet,
				},
				{ transaction }
			);

			//Handling accounting records adding
			{
				const accountingService = AccountingService(instance);
				const adminsService = AdminService(instance);
				const vendor = await adminsService.findVendorById(order.get("vendorId"));

				const netProductsPrice = +order.get("finalPrice") - +order.get("deliveryCost");

				await accountingService.addAccounting(
					{
						orderId: order.get("id"),
						vendorId: order.get("vendorId"),
						status: AccountingStatus.in,
						amount: ((100 - vendor.get("appPercentage")) * netProductsPrice) / 100.0,
					},
					transaction
				);
			}

			// Handling order tracking records
			{
				const orderTrackingService = OrderTrackingService(instance);
				await orderTrackingService.create({
					orderId: order.get("id"),
					status: OrderStatusEnum.PLACED,
					transaction,
				});
			}

			try {
				orderService.sendEmailsUponOrderCreation({
					langCode: order.get("user")?.get("preferredLang") || "en",
					order,
				});
			} catch (err) {
				console.log(err);
			}
			// Clearing the cart
			await cartsService.clearCart({ cart, transaction });

			await transaction.commit();
			const response = orderResponse({
				order,
				langCode: cart.get("user").get("preferredLang") || "ar",
				multiLang: false,
			});

			return response;
		} catch (err) {
			await transaction.rollback();
			throw err;
		}
	});

	instance.post("/webhook", {}, async (request) => {
		const payload = request.body as ISCWebhookSentPayload;
		const verificationResult = verifySkipCashWebhook(
			payload,
			instance.configs.skipCash.webhookKey,
			request.headers.authorization as string
		);
		if (!verificationResult) {
			throw instance.httpErrors.forbidden();
		}

		const { Amount, CardType, PaymentId, StatusId, TransactionId } = payload;
		const payment = await paymentService.getPaymentDetails(PaymentId);
		if (!payment) return;
		// if the payment status = 2 (success) and we have payment record in our db, but it is not handled yet
		if (StatusId == 2 && +payment.statusId !== StatusId) {
			const originalPayment = await paymentService.getPaymentDetailsFromSkipCash(PaymentId);

			if (
				originalPayment?.data?.resultObj?.statusId == StatusId &&
				originalPayment?.data?.resultObj?.transactionId == TransactionId
			) {
				await payment.update({ statusId: "2", cardType: CardType });
			}
		}
	});
};
