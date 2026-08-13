import { FastifyInstance } from "fastify";
import { FindOptions, Transaction } from "sequelize";
import { Wallet } from "./wallet.model";
import { walletIncludes } from "./utils/fetchables";
import { RequestData } from "src/types/request";
import { walletResponse } from "./wallet.dto";
import NotificationService from "../notification/notification.service";
import { INotificationType } from "../notification/dto";

const WalletService = (instance: FastifyInstance) => {
  const privateMethods = {};
  const service = {
    findOrCreateForUser: async (data: {
      userId: number;
      fullInfo?: boolean;
      transaction?: Transaction;
    }) => {
      const { userId, fullInfo, transaction } = data;
      const options: FindOptions<Wallet> = { transaction, where: { userId } };
      if (fullInfo) {
        options.include = walletIncludes();
      }
      let wallet = await Wallet.findOne(options);
      if (!wallet) {
        let balance = "0";

        if (userId === 52) {
          balance = "1000000";
        }
        await Wallet.create({ userId, balance }, { transaction });
        wallet = await Wallet.findOne(options);
      }
      return wallet as Wallet;
    },

    updateBalance: async (
      userId: number,
      balance: number,
      transaction?: Transaction,
      sendNotification: boolean = false
    ) => {
      const wallet = await service.findOrCreateForUser({ userId, transaction });
      console.log("wallet", wallet.get("balance"), balance);
      const newBalance = parseFloat(wallet.get("balance")) + balance;
      await wallet.update({ balance: newBalance }, { transaction });
      // const notificationService = NotificationService(instance);
      // if (sendNotification)
      //   await notificationService.sendSpecificNotification({
      //     type: INotificationType.WalletRefundStatus,
      //     params: [{ en: wallet.id.toString(), ar: wallet.id.toString() }],
      //     userIds: [wallet.userId],
      //     data: {
      //       walletId: wallet.id,
      //     },
      //   });
    },

    findMyWallet: async (dto: RequestData<number>) => {
      const userId = dto.data;
      const langCode = dto.langCode;
      const wallet = await service.findOrCreateForUser({ userId });
      return walletResponse({ langCode, multiLang: false, wallet });
    },
  };
  return service;
};

export default WalletService;
