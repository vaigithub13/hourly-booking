import { ProductResponse, SKUResponse } from "./../product/product.dto";
import { VendorResponse } from "../admin/admin.dto";
import { Product, SKU } from "../product/product.model";
import { IUserResponse, userResponse } from "../user/user.dto";
import { IOrderResponse, orderResponse } from "./order.dto";
import { CancelOrderRequest, Order } from "./order.model";
import { IVendorResponse, vendorResponse } from "../vendor/vendor.dto";
import { CustomAttributes, SKUCustomAttributes } from "../custom_attributes/custom_attributes.model";
import { User } from "../user/user.model";
import { Admin } from "../admin/admin.model";
import { OrderItem } from "./order-item/order-item.model";
import { Includeable } from "sequelize";
import { Location } from "../locations/locations.model";
import { IUserAddressResponse, userAddressResponse } from "../user-address/user-address.dto";
import { UserAddress } from "../user-address/user-address.model";
import { ReturnOrder, ReturnOrderItems } from "./return-order.model";
import { JObject } from "src/types/common-types";
import { RefundTargetEnum } from "./cancel-order.dto";
import { CustomAttributesResponse } from "../custom_attributes/custom_attributes.dto";
import { Length } from "sequelize-typescript";
import { ReturnOrderRequestStatusEnum, returnOrderStatus, ReturnOrderStatusData } from "./return-order.enum";

export const returnOrderStatusForTracking = [
	{ code: 4, status: ReturnOrderRequestStatusEnum.OnTheWay },
	{ code: 5, status: ReturnOrderRequestStatusEnum.Complete },
];

export const returnOrderInfo: Includeable[] = [
	{ model: ReturnOrderItems, include: [SKU] },
	User,
	Admin,
	UserAddress,
	{ model: Order, include: [Location, OrderItem] },
];

export interface ICreateReturnOrderRequest {
	orderId: number;
	returnReason: string;
	images: string[];
	userAddressId: number;
	products: {
		productId: number;
		skuId: number;
		quantity: number;
	}[];
}

export interface IApproveOrRejectRequest {
	cancelReqId: number;
	action: "approve" | "reject";
}

// Here interface for cancelling the order
export interface ICancelOrderRequest {
	orderId: number;
}

export interface IGetReturnOrderRequestsQueryDto {
	id?: number;
	userId?: number;
	vendorId?: number;
	status?: ReturnOrderRequestStatusEnum;
}

export interface IReturnOrderItemsResponse {
	id: number;
	sku: any;
	product: any;
	length: any;
	color: any;
	size: any;
	quantity: number;
	price: number;
	totalPrice: number;
}

export interface IReturnOrderRequestResponse {
	id: number;
	user?: IUserResponse;
	order?: IOrderResponse;
	userAddress: IUserAddressResponse;
	items?: IReturnOrderItemsResponse[];
	status: ReturnOrderRequestStatusEnum;
	refundTarget: RefundTargetEnum;
	vendorReason: string;
	vendorImages: string[];
	deliveryPaidByVendor: boolean;
	deliveryCost: number;
	returnReason?: string;
	amountReturnedToWallet: number;
	images: string[];
	vendor?: IVendorResponse;
	totalPrice: number;
	createdAt: string;
	tracking: { statusId: number; status: string; loggedAt: Date }[];
}

export const returnOrderItemsResponse = (data: { returnOrderItem: ReturnOrderItems; langCode: string; multiLang: boolean }) => {
	const { id, skuData, productData, size, color, length, price, quantity, totalPrice } = data.returnOrderItem;
	const response: IReturnOrderItemsResponse = {
		id,
		sku: skuData ? SKUResponse(skuData as SKU, data.langCode, data.multiLang) : undefined,
		product: productData ? ProductResponse(productData as Product, data.langCode, data.multiLang) : undefined,
		length: length ? CustomAttributesResponse(length as CustomAttributes, data.langCode, data.multiLang) : null,
		color: color ? CustomAttributesResponse(color as CustomAttributes, data.langCode, data.multiLang) : null,
		size: size ? CustomAttributesResponse(size as CustomAttributes, data.langCode, data.multiLang) : null,
		price,
		quantity,
		totalPrice,
	};

	return response;
};

export const returnOrderRequestResponse = (data: { returnReq: ReturnOrder; langCode: string; multiLang: boolean }) => {
	if (!data.returnReq) return;
	const { returnReq, langCode, multiLang } = data;
	const {
		id,
		user,
		order,
		status,
		vendor,
		items,
		tracking,
		amountReturnedToWallet,
		vendorImages,
		deliveryPaidByVendor,
		vendorReason,
		refundTarget,
		totalPrice,
		userAddress,
		returnReason,
		deliveryCost,
		images,
		createdAt,
	} = returnReq;
	const response: IReturnOrderRequestResponse = {
		id,
		status,
		userAddress: userAddressResponse(userAddress),
		user: user ? userResponse(user, langCode) : undefined,
		returnReason,
		tracking,
		deliveryPaidByVendor,
		deliveryCost,
		vendorReason,
		vendorImages,
		refundTarget,
		amountReturnedToWallet,
		totalPrice,
		images,
		order: order ? orderResponse({ order, langCode, multiLang }) : undefined,
		vendor: vendor ? vendorResponse(vendor, langCode, multiLang) : undefined,
		items: items ? items.map((item) => returnOrderItemsResponse({ returnOrderItem: item, langCode, multiLang })) : undefined,
		createdAt,
	};
	return response;
};
