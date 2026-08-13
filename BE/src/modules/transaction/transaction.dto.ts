import { adminResponse } from "./../admin/admin.dto";
import { AttributeEnum } from "src/types/enums";
import { LangObject } from "../../types/common-types";
import { TransactionModel } from "./transaction.model";
import { AdminResponse } from "../admin/admin.dto";
import { IVendorResponse, vendorResponse } from "../vendor/vendor.dto";
import { IOrderResponse, orderResponse } from "../order/order.dto";

export interface TransactionResponse {
	id?: number;
	amount?: number;
	description?: LangObject;
	date?: string;
	type?: number;
	vendor?: IVendorResponse;
	order?: IOrderResponse;
	attachment?: string;
}

export interface TransactionDto {
	amount?: number;
	type: number;
	orderId: number;
	vendorId: number;
	description: LangObject;
	date: string;
	adminShare?: number;
	vendorShare?: number;
	attachment?: string;
}

export const TransactionResponse = (data: TransactionModel, langCode: string, multiLang: boolean): TransactionResponse => {

    return {
        id: data.id,
        amount: data.amount,
        date: data.date,
        description: data.description,
        type: data.type,
        vendor: data.vendor ? vendorResponse(data.vendor, langCode, multiLang) : undefined,
		order: data.order ? orderResponse({ order: data.order, langCode, multiLang }) : undefined,
        attachment: data.attachment
    }

}

