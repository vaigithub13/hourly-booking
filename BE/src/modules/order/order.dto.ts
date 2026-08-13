import { OrderItem } from "./order-item/order-item.model";
import { VendorResponse, adminVendorResponse } from "../admin/admin.dto";
import { Cart } from "../cart/cart.model";
import { LocationResponse, locationResponse } from "../locations/locations.dto";
import { Location } from "../locations/locations.model";
import { IUserResponse, userResponse } from "../user/user.dto";
import { User } from "../user/user.model";
import { IOrderItemResponse, orderItemResponse } from "./order-item/order-item.dto";
import { Order } from "./order.model";
import { JObject } from "src/types/common-types";
import { UserAddress } from "../user-address/user-address.model";
import { IUserAddressResponse, userAddressResponse } from "../user-address/user-address.dto";
import { ReturnOrderRequestStatusEnum } from "./return-order.enum";
import { accountingResponse, AccountingResponse } from "../accounting/accounting.dto";

export enum OrderStatusEnum {
	PLACED = "Placed",
	CONFIRMED = "Confirmed",
	ReadyToShip = "Ready To Ship",
	SHIPPED = "Out For Delivery",
	DELIVERED = "Delivered",
	RETURNED = "Returned",
	CANCELLED = "Cancelled",
}

export const passCompanyStatus = [
	{ code: 4, status: "Started" },
	{ code: 5, status: "Successful" },
];

export const orderStatusesForTracking = [
	{ code: 4, status: OrderStatusEnum.SHIPPED },
	{ code: 5, status: OrderStatusEnum.DELIVERED },
];

const orderStatusTranslations = {
	[OrderStatusEnum.PLACED]: { en: "Placed", ar: "تم الطلب" },
	[OrderStatusEnum.CONFIRMED]: { en: "Confirmed", ar: "تم القبول" },
	[OrderStatusEnum.ReadyToShip]: { en: "Ready To Ship", ar: "جاهزة للتوصيل" },
	[OrderStatusEnum.SHIPPED]: { en: "Out For Delivery", ar: "قيد التوصيل" },
	[OrderStatusEnum.DELIVERED]: { en: "Delivered", ar: "تم التوصيل" },
	[OrderStatusEnum.RETURNED]: { en: "Returned", ar: "تم الإرجاع" },
	[OrderStatusEnum.CANCELLED]: { en: "Cancelled", ar: "تم الإلغاء" },
};

export const orderStatus = {
	[OrderStatusEnum.PLACED]: { code: 1, en: "Placed", ar: "تم الطلب" },
	[OrderStatusEnum.CONFIRMED]: { code: 2, en: "Confirmed", ar: "تم القبول" },
	[OrderStatusEnum.ReadyToShip]: { code: 3, en: "Ready To Ship", ar: "جاهزة للتوصيل" },
	[OrderStatusEnum.SHIPPED]: { code: 4, en: "Out For Delivery", ar: "قيد الشحن" },
	[OrderStatusEnum.DELIVERED]: { code: 5, en: "Delivered", ar: "تم التوصيل" },
};
export enum PaymentMethodEnum {
	CREDIT_CART = "Credit card",
	APPLE_PAY = "Apple pay",
	WALLET = "Wallet",
}
export interface IWebhook {
	task_id: string;
	status: string;
	type: string;
	description: string;
	lat: string;
	lng: string;
	address: string;
	receiver_name: string;
	eta: string;
}
export enum PaymentStatusEnum {
	PENDING = "Pending", // Payment is initiated but not confirmed
	PARTIALLY_PAID = "Partially Paid",
	COMPLETED = "Completed", // Payment was successful
	FAILED = "Failed", // Payment attempt failed
	CANCELED = "Canceled", // Payment was canceled by the user
	REFUNDED = "Refunded", // Payment was refunded
}

export const getOrderStatusesRank = () => {
	const result: JObject = {};
	Object.values(OrderStatusEnum).map((status: string, index: number) => (result[status] = index));
	return result;
};

export interface IGetOrdersQuery {
	status?: OrderStatusEnum;
	userId?: number;
	locationId?: number;
	vendorId?: number;
	isPaid?: boolean;
}

export interface ICreateOrderDto {
	cart: Cart; // should be passed by the controller
	userAddress: UserAddress;
	user: User; // should be passed by the controller
	location: Location; // should be passed by the controller
	payWithWallet: boolean;
}

export interface IUpdateOrderStatusDto {
	id: number;
	newStatus: string;
}

export interface IOrderResponse {
	id: number;
	subTotal: number;
	grossTotal: number;
	walletPaidAmount: number;
	status: string;
	statusId: number; // it is not id for DB, just an identifier added (the order of the status in the Enum)
	estimatedDeliveryDays: number;
	deliveryCost: number;
	finalPrice: number;
	isPaid: boolean;
	finalPriceWithoutReturned?: number;
	rate?: number;
	taskId: string;
	canBeCanceled: boolean;
	canBeReturned: boolean;
	itemsCount?: number;
	totalItemsQuantity?: number;
	deliveryId?: string;
	createdAt?: string;
	totalDiscount: number;
	returnOrderId?: number;
	paymentMethod?: string;
	note?: string;
	paymentStatus?: string;
	location: LocationResponse;
	user?: IUserResponse;
	userAddress?: IUserAddressResponse;
	vendor?: VendorResponse;
	items?: IOrderItemResponse[];
	accounting: any;
}

export interface IRateOrder {
	id: number;
	rate: number;
}

export const orderResponse = (data: { order: Order; langCode: string; multiLang?: boolean }) => {
	const { langCode, order, multiLang } = data;
	const {
		id,
		subTotal,
		grossTotal,
		status,
		estimatedDeliveryDays,
		returnOrderId,
		location,
		user,
		rate,
		deliveryCost,
		walletPaidAmount,
		canBeReturned,
		finalPriceWithoutReturned,
		finalPrice,
		userAddress,
		totalDiscount,
		note,
		deliveryId,
		taskId,
		paymentMethod,
		paymentStatus,
		canBeCanceled,
		vendor,
		items,
		isPaid,
		createdAt,
		accounting,
	} = order;
	const response: IOrderResponse = {
		id,
		subTotal,
		grossTotal,
		deliveryCost,
		walletPaidAmount,
		finalPriceWithoutReturned,
		isPaid,
		deliveryId,
		finalPrice,
		totalDiscount,
		status: orderStatusTranslations[status][langCode || "en"],
		statusId: getOrderStatusesRank()[status] + 1,
		taskId,
		estimatedDeliveryDays,
		paymentMethod,
		paymentStatus,
		rate,
		note,
		canBeCanceled,
		returnOrderId,
		canBeReturned,
		itemsCount: (order.get("itemsCount") as number | undefined) || undefined,
		totalItemsQuantity: (order.get("totalItemsQuantity") as number | undefined) || undefined,
		createdAt,
		location: locationResponse(location, langCode, multiLang),
		user: user ? userResponse(user, langCode) : undefined,
		userAddress: userAddress ? userAddressResponse(userAddress) : undefined,
		vendor: vendor ? adminVendorResponse(vendor, langCode) : undefined,
		items: items ? items.map((item: OrderItem) => orderItemResponse({ orderItem: item, multiLang, langCode })) : undefined,
		accounting: accounting ? AccountingResponse(accounting, langCode) : undefined,
	};
	return response;
};
