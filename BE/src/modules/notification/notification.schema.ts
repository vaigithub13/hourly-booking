import { Type } from "@sinclair/typebox";
import { headersSchema } from "../../utils/json-schema";
import {
  idParamObject,
  LangObjectType,
  responseMessage,
} from "src/types/common-types";

export const NotificationResponse = Type.Object({
  id: Type.Number(),
  type: Type.Optional(Type.String()),
  userId: Type.Optional(Type.Number()),
  user: Type.Optional(Type.Any()),
  isPublic: Type.Optional(Type.Boolean()),
  content: Type.Optional(LangObjectType),
  title: Type.Optional(LangObjectType),
  data: Type.Optional(Type.Any({})),
  seen: Type.Optional(Type.Boolean()),
  dateTime: Type.String(),
  isSent: Type.Boolean(),
});

export const getMyNotifications = {
  description: "get my notifications { user token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Notifications"],
  security: [
    {
      userToken: [],
    },
  ],
  querystring: Type.Object({
    limit: Type.Number(),
    offset: Type.Number(),
    isSortAsc: Type.Optional(Type.Boolean({ description: "" })),
    isSortDesc: Type.Optional(Type.Boolean({ description: "" })),
  }),
  response: {
    200: Type.Object({
      count: Type.Number(),
      rows: Type.Array(NotificationResponse),
    }),
  },
};

export const getNotificationDetails = {
  description: "get notification details  { user token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Notifications"],
  security: [
    {
      userToken: [],
    },
  ],
  params: Type.Object({
    id: Type.Number(),
  }),
  response: {
    200: NotificationResponse,
  },
};

export const countUnseenNotifications = {
  description: "get number of unseen notifications  { user token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Notifications"],
  security: [
    {
      userToken: [],
    },
  ],
  response: {
    200: Type.Number(),
  },
};

export const createPublicNotification = {
  description:
    "Create public notification (Create before sending, sending in different API)",
  headers: Type.Ref(headersSchema),
  tags: ["Notifications"],
  security: [{ adminToken: [] }],
  body: Type.Object({
    title: LangObjectType,
    content: LangObjectType,
  }),
  response: {
    200: NotificationResponse,
  },
};

export const sendPublicNotification = {
  description: "Send public notification (Send already created notification)",
  headers: Type.Ref(headersSchema),
  tags: ["Notifications"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  response: {
    200: responseMessage,
  },
};

export const markAllAsSeen = {
  description: "mark all as seen",
  tags: ["Notifications"],
  headers: Type.Ref(headersSchema),
  security: [
    {
      userToken: [],
    },
  ],
  response: {
    200: Type.Object({
      message: Type.String(),
    }),
  },
};
