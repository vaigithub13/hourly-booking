import { FastifyInstance } from "fastify";
import { RequestData } from "src/types/request";
import { Order } from "../order/order.model";
import { OrderTracking } from "./order-tracking.model";
import { orderTrackingResponse } from "./order-tracking.dto";
import { orderCriteria } from "src/utils/common-methods";
import { Transaction } from "sequelize";

export const OrderTrackingService = (instance: FastifyInstance) => {
	const service = {
		create: async (data: { status: string; orderId: number; transaction?: Transaction }) => {
			return await OrderTracking.create({ ...data }, { transaction: data.transaction });
		},

		delete: async (data: { status: string; orderId: number; transaction?: Transaction }) => {
			return await OrderTracking.destroy({
				where: { orderId: data.orderId, status: data.status },
				transaction: data.transaction,
			});
		},
		getByOrderId: async (dto: RequestData<{ order: Order }>) => {
			const { order } = dto.data;
			const trackings = await OrderTracking.findAll({
				where: { orderId: order.get("id") },
				order: orderCriteria({ sortBy: "createdAt", sort: "ASC" }),
			});
			return trackings.map((tr) => orderTrackingResponse({ trackingRecord: tr }));
		},
	};
	return service;
};

export default OrderTrackingService;
