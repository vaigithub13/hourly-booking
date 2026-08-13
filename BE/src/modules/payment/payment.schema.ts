import { Type } from "@sinclair/typebox";
import { deviceSchema } from "src/utils/json-schema";

const paymentResultObjSchema = Type.Object({
  id: Type.String(),
  statusId: Type.Number(),
  created: Type.String(),
  payUrl: Type.String(),
  amount: Type.Number(),
  currency: Type.String(),
  transactionId: Type.Union([Type.String(), Type.Null()]),
  custom1: Type.Union([Type.String(), Type.Null()]),
  visaId: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
});

const paymentSchema = Type.Object({
  id: Type.Number(),
  amount: Type.String(),
  uid: Type.String(),
  transactionId: Type.String(),
  custom1: Type.String(),
  statusId: Type.String(),
  paymentUrl: Type.String(),
  paymentId: Type.String(),
  skipCashResponse: paymentResultObjSchema,
  cardType: Type.String(),
});

export const createPayment = {
  description:
    "Create payment (FE calls this API after validating cart and creating order it will generate payment url and create payment in SkipCash).",
  headers: Type.Ref(deviceSchema),
  tags: ["Payment"],
  security: [{ userToken: [] }],
  body: Type.Object({
    orderId: Type.Integer(),
  }),
  response: { 200: paymentSchema },
};
