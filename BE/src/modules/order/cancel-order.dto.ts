import { adminVendorResponse, VendorResponse } from "../admin/admin.dto";
import { IUserResponse, userResponse } from "../user/user.dto";
import { IOrderResponse, orderResponse } from "./order.dto";
import { CancelOrderRequest } from "./order.model";

export enum CancelOrderRequestStatusEnum {
	CANCELLED = "Cancelled",
	REFUNDED = "Refunded",
}

export enum RefundTargetEnum {
	WALLET = "Wallet",
	ORIGINAL_METHOD = "Original Payment Method",
	PENDING = "PENDING",
}

export interface ICreateCancelOrderRequest {
	orderId: number;
}

export interface ISetRefundTarget {
	cancelRequest: CancelOrderRequest;
	refundTarget: RefundTargetEnum;
}

export interface IApproveRequest {
	cancelReqId: number;
}

// Here interface for cancelling the order
export interface ICancelOrderRequest {
	orderId: number;
}

export interface IGetCancelOrderRequestsQueryDto {
	userId?: number;
	vendorId?: number;
}

export interface ICancelOrderRequestResponse {
	id: number;
	refundTarget: RefundTargetEnum | "Pending";
	user?: IUserResponse;
	order: IOrderResponse;
	status: CancelOrderRequestStatusEnum;
	vendor?: VendorResponse;
}

export const cancelOrderRequestResponse = (data: { cancelReq: CancelOrderRequest; langCode: string; multiLang: boolean }) => {
	const { cancelReq, langCode, multiLang } = data;
	const { id, user, order, status, refundTarget, vendor } = cancelReq;
	const response: ICancelOrderRequestResponse = {
		id,
		refundTarget,
		status,
		order: orderResponse({ order, langCode, multiLang }),
		user: user ? userResponse(user, langCode) : undefined,
		vendor: vendor ? adminVendorResponse(vendor, langCode) : undefined,
	};
	return response;
};
