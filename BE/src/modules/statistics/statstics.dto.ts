import { ReturnOrderRequestStatusEnum } from "./../order/return-order.dto";
export interface GetTotalOrder {
	from: Date;
	to: Date;
	vendorId?: number;
}
export interface GetTotalCustomers {
}
export interface GetTotalVendors {
}

export interface GetTotalReturnOrders {
	vendorId?: number;
	status?: ReturnOrderRequestStatusEnum;
}

export interface GetTotalRevenue {
	vendorId?: number;
}
export interface GetTotalEarning {
	vendorId?: number;
}

export interface GetOrderStatisticsLineChart {
	from?: Date;
	to?: Date;
}

export interface GetUserStatisticsLineChart {
	from?: Date;
	to?: Date;
}
