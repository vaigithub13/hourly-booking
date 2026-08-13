import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { getFastifyInstance } from "src/fastifyInstance";
import { Configuration } from "src/modules/configuration/configuration.model";
import ConfigurationService from "src/modules/configuration/configuration.service";
import { CancelOrderRequestStatusEnum } from "src/modules/order/cancel-order.dto";
import CancelOrderService from "src/modules/order/cancel-order.service";
import { CancelOrderRequest } from "src/modules/order/order.model";
import { myDayjs } from "src/utils/dayjs/my-dayjs";

export const cronJobs = {
  testingCron: () => {
    console.log("Running a task every minute:", new Date().toISOString());
  },
  acceptOrdersCancellation: async () => {
    const instance = getFastifyInstance();

    const cancelReqs = await CancelOrderRequest.findAll({
      attributes: ["id", "status", "createdAt", "orderId"],
    });

    const cancelOrderReqService = CancelOrderService(instance);

    cancelReqs.forEach(async (cancelReq: CancelOrderRequest) => {
      const createdAt = myDayjs(cancelReq.get("createdAt"));
      const now = myDayjs();
      const walletRefundTimeHasPassed = myDayjs(createdAt).isBefore(
        now.subtract(30, "minutes")
      );
      if (
        !walletRefundTimeHasPassed ||
        cancelReq.status === CancelOrderRequestStatusEnum.REFUNDED
      )
        return;
      const transaction = await instance.db.transaction();
      try {
        await cancelOrderReqService.cancelOrder({
          orderId: cancelReq.get("orderId"),
          transaction,
        });
        await cancelReq.update(
          { status: CancelOrderRequestStatusEnum.REFUNDED },
          { transaction }
        );
        await transaction.commit();
        console.log({ request: cancelReq.orderId, cancelYes: true });
      } catch (ex) {
        await transaction.rollback();
        console.log("Failed cronjob cancellation");
        console.log(ex);
      }
    });
  },
};
