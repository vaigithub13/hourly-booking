import { AccountingStatus } from "src/types/enums";
import { LangObject } from "../../types/common-types";
import { Accounting } from "./accounting.model";
import { IVendorResponse, vendorResponse } from "../vendor/vendor.dto";
import { IOrderResponse, orderResponse } from "../order/order.dto";
import {
  IReturnOrderRequestResponse,
  returnOrderRequestResponse,
} from "../order/return-order.dto";

export interface IAddAccounting {
  vendorId: number;
  returnOrderId?: number;
  orderId: number;
  amount: number;
  isRefunded?: boolean;
  status: AccountingStatus;
}

export interface ISearchAccounting {
  vendorId?: number;
  orderId?: number;
  returnOrderId?: number;
  date?: string;
  status?: AccountingStatus;
  name?: string;
}

export interface ISearchVendor {
  name?: string;
}

export interface accountingResponse {
  id: number;
  amount: number;
  type: AccountingStatus;
  createdAt: string;
  orderId: number;
  returnOrderId?: number;
  vendor: IVendorResponse | undefined;
}

export const AccountingResponse = (
  data: Accounting,
  langCode: string
): accountingResponse => {
  return {
    id: data.id,
    amount: data.amount,
    orderId: data.orderId,
    returnOrderId: data.returnOrderId,
    type: data.status,
    createdAt: data.createdAt,
    vendor: data.vendor ? vendorResponse(data.vendor, langCode, true) : undefined,
  };
};
export interface accountingResponseFullData {
  id: number;
  amount: number;
  type: AccountingStatus;
  createdAt: string;
  vendor: IVendorResponse;
  order: IOrderResponse;
  returnOrder?: IReturnOrderRequestResponse;
}
export const AccountingResponseFullData = (
  data: Accounting,
  langCode: string
): accountingResponseFullData => {
  return {
    id: data.id,
    amount: data.amount,
    type: data.status,
    createdAt: data.createdAt,
    vendor: vendorResponse(data.vendor, langCode, true),
    order: orderResponse({ order: data.order, langCode, multiLang: true }),
    returnOrder: returnOrderRequestResponse({
      returnReq: data.returnOrder,
      langCode,
      multiLang: true,
    }),
  };
};

export interface IAccountingData {
  name?: string;
}
