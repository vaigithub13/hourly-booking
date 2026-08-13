import { getOrderStatusesRank } from "../order/order.dto";
import { OrderTracking } from "./order-tracking.model";

export interface ICreateOrderTrackingDto {
  status: string;
  loggedAt: string;
}

export interface IOrderTrackingResponse {
  id: number;
  status: string;
  statusId: number;
  loggedAt: string;
}

export const orderTrackingResponse = (data: {
  trackingRecord: OrderTracking;
}) => {
  const { trackingRecord } = data;
  const { id, createdAt, status } = trackingRecord;
  const response: IOrderTrackingResponse = {
    id,
    status,
    loggedAt: createdAt,
    statusId: getOrderStatusesRank()[status] + 1,
  };
  return response;
};
