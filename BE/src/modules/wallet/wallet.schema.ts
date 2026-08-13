import { Type } from "@sinclair/typebox";
import { deviceSchema } from "src/utils/json-schema";

export const walletSchema = Type.Object({
  id: Type.Integer(),
  balance: Type.Number(),
});

export const getMyWallet = {
  description: "Get my wallet",
  headers: Type.Ref(deviceSchema),
  tags: ["Wallet"],
  security: [{ userToken: [] }],
  response: {
    200: walletSchema,
  },
};
