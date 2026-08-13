import { FastifyInstance } from "fastify";
import axios from "axios";
import fp from "fastify-plugin";
import { notificationDto } from "../../modules/notification/dto";
import { User } from "src/modules/user/user.model";

const notificationsPlugin = async (instance: FastifyInstance) => {
  instance.decorate(
    "sendNotification",
    async (notification: notificationDto) => {
      const headers = {
        "content-type": "application/json; charset=utf-8",
        Authorization: `Bearer ${instance.configs.oneSignal.apiKey}`,
      };
      const url = "https://api.onesignal.com/notifications?c=push";
      const app_id = instance.configs.oneSignal.appId;
      try {
        const response = await axios.post(
          url,
          {
            app_id: app_id,
            contents: {
              en: notification.contents.en,
              ar: notification.contents.ar,
            },
            headings: {
              en: notification.headings.en,
              ar: notification.headings.ar,
            },
            include_player_ids: [...notification.devicesIds!],
            data: notification.data,
          },
          {
            headers,
          }
        );
        return response;
      } catch (error: any) {
        return error;
      }
    }
  );
  instance.decorate(
    "sendPublicNotification",
    async (notification: notificationDto) => {
      const headers = {
        "content-type": "application/json; charset=utf-8",
        Authorization: `Bearer ${instance.configs.oneSignal.apiKey}`,
      };

      const url = "https://api.onesignal.com/notifications?c=push";
      const app_id = instance.configs.oneSignal.appId;
      let users = (await User.findAll({})).map((el) => el.deviceId);
      users = users.filter((el) => el && el.split("-").length > 3);

      const payload = {
        app_id: app_id,
        contents: {
          en: notification.contents.en,
          ar: notification.contents.ar,
        },
        headings: {
          en: notification.headings.en,
          ar: notification.headings.ar,
        },
        included_segments: ["Total Subscriptions"],
        data: notification.data,
      };
      try {
        const response = await axios.post(url, payload, {
          headers,
        });
        // console.log("response.response");
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error.response.data);

        return error;
      }
    }
  );
};

export default fp(notificationsPlugin, {
  name: "notification-plugin",
});
