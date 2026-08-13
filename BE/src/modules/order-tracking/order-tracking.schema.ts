import { Type } from "@sinclair/typebox";
import { idParamObject } from "src/types/common-types";
import { deviceSchema } from "src/utils/json-schema";

const orderTrackingSchema = Type.Object({
  id: Type.Integer(),
  status: Type.String(),
  statusId: Type.Integer(),
  loggedAt: Type.String(),
});

export const getOrderTrackingsForOrder = {
  description: "Get order trackings for specific order (by ID).",
  tags: ["Order Tracking"],
  headers: Type.Ref(deviceSchema),
  security: [{ adminToken: [], userToken: [] }],
  params: idParamObject,
  response: { 200: Type.Array(orderTrackingSchema) },
};
