import { FastifyInstance } from "fastify";
import {
  INotificationType,
  NotificationMapTemplate,
  notificationResponse,
  notificationServiceDto,
  notificationTemplate,
} from "./dto";
import { Notifications } from "./notification.model";
import { User } from "../../modules/user/user.model";

import UserService from "../user/user.service";
import { LangObject, UserTypeEnum } from "../../types/common-types";
import { PaginatedRequest, RequestData } from "../../types/request";
import admin from "../admin";
import { translateMessage } from "src/utils/common-methods";
import { dot } from "node:test/reporters";
import { Transaction } from "sequelize";
import { orderCriteria } from "src/utils/common-methods";

const NotificationService = (instance: FastifyInstance) => {
  //methods start with find will use only for communication between services

  const service = {
    findById: async (id: number) => {
      const notification = await Notifications.findOne({
        where: { id },
        include: [{ model: User }],
      });
      if (!notification) {
        throw instance.httpErrors.badRequest("notification.response.Notfound");
      }
      return notification;
    },
    findByIdWithoutExp: async (id: number) => {
      const notification = await Notifications.findOne({
        where: { id },
        include: [{ model: User }],
      });

      return notification;
    },

    sendSpecificNotification: async (data: notificationServiceDto) => {
      const template = notificationTemplate(data.type);
      if (data.params && data.params.length) {
        for (let i = 0; i < data.params.length; i++) {
          template.contents.en = template.contents.en.replace(
            NotificationMapTemplate[i],
            data.params[i].en
          );
          template.contents.ar = template.contents.ar.replace(
            NotificationMapTemplate[i],
            data.params[i].ar
          );
        }
      }
      const userService = UserService(instance);
      const devicesIds: Array<string> = [];
      if (data.userIds) {
        for (let i = 0; i < data.userIds.length; i++) {
          const user = await userService.findById({ id: data.userIds[i] });
          if (user?.deviceId) devicesIds.push(user.deviceId);
        }
      }

      if (devicesIds.length || data.deviceId) {
        let devices: string[] = [];
        if (devicesIds.length) {
          devices = devicesIds;
        }
        if (data.deviceId) {
          devices.push(data.deviceId);
        }
        instance.sendNotification({
          contents: template.contents,
          headings: template.headings,
          data: data.data ?? {},
          devicesIds: devices,
        });
      }
      if (data.userIds) {
        for await (const userId of data.userIds) {
          const notification = new Notifications({
            type: data.type,
            userId: userId,
            isPublic: false,
            content: template.contents,
            title: template.headings,
            data: data.data,
            seen: data.seen,
          });
          await notification.save();
        }
      }
      return true;
    },

    createAdminNotification: async (
      dto: RequestData<{
        title: LangObject;
        content: LangObject;
      }>
    ) => {
      const { content, title } = dto.data;
      const adminNotification = await Notifications.create({
        isPublic: true,
        content,
        title,
        type: INotificationType.GeneralNotification,
        data: {},
        userId: null,
        isSent: false,
      });
      return notificationResponse(adminNotification, dto.langCode, true);
    },

    sendAdminNotification: async (
      transaction: Transaction,
      dto: RequestData<number>
    ) => {
      const id = dto.data;
      const notification = await service.findById(id);
      await instance.sendPublicNotification({
        contents: notification.content,
        headings: notification.title,
        data: {},
        devicesIds: [],
      });
      const users = await User.findAll({ attributes: ["id"] });
      const notifications = users.map((user) => ({
        isPublic: true,
        content: notification.content,
        title: notification.title,
        type: INotificationType.GeneralNotification,
        data: {},
        userId: user.id,
      }));
      await Notifications.bulkCreate(notifications, { transaction });
      await notification.update({ isSent: true }, { transaction });
      return {
        message: translateMessage("common.response.success", dto.langCode),
      };
    },

    getMyNotifications: async (dto: PaginatedRequest<undefined>) => {
      const { limit, offset, request, langCode } = dto;

      if (!request.user) {
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      }
      if (dto.request.user.role !== UserTypeEnum.ADMIN) {
        const response = await Notifications.findAndCountAll({
          limit: limit,
          offset: offset,
          where: { userId: request.user.id },
          order: orderCriteria({}),
        });
        const rows = response.rows.map((el) =>
          notificationResponse(el, langCode, request.multiLang)
        );
        await Notifications.update(
          { seen: true },
          {
            where: {
              userId: request.user.id,
            },
          }
        );
        return {
          count: response.count,
          rows: rows,
        };
      } else {
        const response = await Notifications.findAndCountAll({
          limit: limit,
          offset: offset,
          where: { userId: null },
        });
        const rows = response.rows.map((el) =>
          notificationResponse(el, langCode, request.multiLang)
        );
        return {
          count: response.count,
          rows: rows,
        };
      }
    },

    getNotificationDetails: async (dto: RequestData<number>) => {
      const { data, request, langCode } = dto;

      if (!request?.user) {
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      }

      const notification = await service.findById(data);

      return notificationResponse(notification, langCode, request?.multiLang);
    },
    markAsSeen: async (dto: RequestData<undefined>) => {
      const { data, request, langCode } = dto;

      if (!request?.user) {
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      }

      await Notifications.update(
        { seen: true },
        { where: { userId: request.user.id } }
      );

      return {
        message: "common.response.success",
      };
    },

    countUnseenNotifications: async (dto: RequestData<undefined>) => {
      const { request } = dto;

      const response = await Notifications.count({
        where: { userId: request?.user.id, seen: false },
      });

      return response;
    },
  };

  return service;
};

export default NotificationService;
