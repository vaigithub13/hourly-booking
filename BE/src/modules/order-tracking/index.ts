import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import OrderTrackingService from "./order-tracking.service";
import * as schema from "./order-tracking.schema";
import { FastifyRequestTypebox } from "src/types/FastifyTypebox";
import { buildRequest } from "src/types/request";
import OrdersService from "../order/order.service";
import { Order } from "../order/order.model";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const orderTrackingService = OrderTrackingService(fastify);
  const ordersService = OrdersService(fastify);

  instance.post(
    "/by-order/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getOrderTrackingsForOrder,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.getOrderTrackingsForOrder>
    ) => {
      const order = (await ordersService.findOrderById({
        id: request.params.id,
        throwError: true,
      })) as Order;

      // if (!request.permission.isAdmin) {
      //   await instance.authorizeUserResource(order, request.user.id);
      // }
      const response = await orderTrackingService.getByOrderId(
        buildRequest({ order }, request.headers["x-lang"], request)
      );
      return response;
    }
  );
};
