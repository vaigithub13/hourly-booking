import { Type } from "@sinclair/typebox";
import { LangObjectType } from "src/types/common-types";
import { headersSchema } from "src/utils/json-schema";

export const configurationsSchema = Type.Object({
  payment: Type.Boolean(),
  supportEmail: Type.String(),
  eventsReceivingEmail: Type.String(),
  homePageText: Type.Union([Type.String(), LangObjectType]),
  privacyAndPolicy: Type.Union([Type.String(), LangObjectType]),
  termsAndConditions: Type.Union([Type.String(), LangObjectType]),
  whatsappNumber: Type.String(),
  deliveryPricing: Type.Object({
    insideDoha: Type.Number(),
    outsideDoha: Type.Number(),
  }),
  ordersReturnReasons: Type.Array(Type.Union([LangObjectType, Type.String()])),
  ordersCancelReasons: Type.Array(Type.Union([LangObjectType, Type.String()])),
  walletRefundTimeInMinutes: Type.Optional(Type.Integer()),
  assetLinks: Type.Optional(Type.Any()),
  appleAppSiteAssociation: Type.Optional(Type.Any()),
});

export const getGlobalConfigurations = {
  description: "Get global configurations",
  headers: Type.Ref(headersSchema),
  security: [{ userToken: [], adminToken: [] }],
  tags: ["Configurations"],
  response: {
    200: configurationsSchema,
  },
};

export const EditGlobalConfigs = {
  description: "Edit global configurations",
  tags: ["Configurations"],
  security: [{ adminToken: [] }],
  body: Type.Object({
    payment: Type.Optional(Type.Boolean({ default: false })),
    homePageText: Type.Optional(LangObjectType),
    email: Type.Optional(Type.String()),
    privacyAndPolicy: Type.Optional(LangObjectType),
    termsAndConditions: Type.Optional(LangObjectType),
    whatsappNumber: Type.Optional(Type.String()),
    deliveryPricing: Type.Optional(
      Type.Object({
        insideDoha: Type.Number(),
        outsideDoha: Type.Number(),
      })
    ),
    ordersReturnReasons: Type.Optional(
      Type.Array(LangObjectType, { maxItems: 10 })
    ),
    ordersCancelReasons: Type.Optional(
      Type.Array(LangObjectType, { maxItems: 10 })
    ),
    walletRefundTimeInMinutes: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 360 })
    ),
  }),
  response: {
    200: configurationsSchema,
  },
};
