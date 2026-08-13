import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import WalletService from "./wallet.service";
import * as schema from "./wallet.schema";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";
import { buildRequest } from "src/types/request";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const walletService = WalletService(fastify);

  instance.get(
    "/my-wallet",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.authorizeUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getMyWallet,
    },
    async (request: FastifyRequestTypebox<typeof schema.getMyWallet>) => {
      const langCode = request.headers["x-lang"];
      const response = await walletService.findMyWallet(
        buildRequest(request.user.id, langCode, request)
      );
      return response;
    }
  );
};
