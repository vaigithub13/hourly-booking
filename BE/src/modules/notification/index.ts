import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import * as schema from "./notification.schema";
import NotificationService from "./notification.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { buildPaginationRequest, buildRequest } from "../../types/request";
import { withTransaction } from "src/utils/sequelize";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  const notificationService = NotificationService(fastify);

  instance.get(
    "/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getNotificationDetails,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.getNotificationDetails>
    ) => {
      const langCode: string = request.headers["x-lang"] as string;
      const { id } = request.params;

      return await notificationService.getNotificationDetails(
        buildRequest(id, langCode, request)
      );
    }
  );

  instance.get(
    "/user",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.getMyNotifications,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.getMyNotifications>
    ) => {
      const langCode: string = request.headers["x-lang"] as string;
      const { limit, offset } = request.query;

      return await notificationService.getMyNotifications(
        buildPaginationRequest(limit, offset, langCode, request)
      );
    }
  );

  instance.get(
    "/count",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.countUnseenNotifications,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.countUnseenNotifications>
    ) => {
      const langCode: string = request.headers["x-lang"] as string;

      return await notificationService.countUnseenNotifications(
        buildRequest(undefined, langCode, request)
      );
    }
  );

  instance.post(
    "/create-public-notifications",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.createPublicNotification,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.createPublicNotification>
    ) => {
      const data = request.body;
      return await notificationService.createAdminNotification(
        buildRequest({ ...data }, request.headers["x-lang"], request)
      );
    }
  );

  instance.post(
    "/send-public-notifications/:id",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.sendPublicNotification,
    },
    async (
      request: FastifyRequestTypebox<typeof schema.sendPublicNotification>
    ) => {
      const { result: response } = await withTransaction(
        instance.db,
        notificationService.sendAdminNotification,
        buildRequest(request.params.id, request.headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.post(
    "/mark-all-as-seen",
    {
      preValidation: instance.auth(
        [instance.authenticate, instance.denyBlockedUser],
        {
          relation: "and",
        }
      ),
      schema: schema.markAllAsSeen,
    },
    async (request: FastifyRequestTypebox<typeof schema.markAllAsSeen>) => {
      const langCode: string = request.headers["x-lang"] as string;
      return await notificationService.markAsSeen(
        buildRequest(undefined, langCode, request)
      );
    }
  );
};
