import {
  LangObjectType,
  idParamObject,
  responseMessage,
} from "./../../types/common-types";
import { headersSchema } from "./../../utils/json-schema";
import { Type } from "@sinclair/typebox";

const FAQSchema = Type.Object({
  id: Type.Number(),
  title: Type.Union([Type.String(), LangObjectType]),
  question: Type.Union([Type.String(), LangObjectType]),
  answer: Type.Union([Type.String(), LangObjectType]),
});

export const getFAQs = {
  description: "Get all FAQs",
  headers: Type.Ref(headersSchema),
  tags: ["FAQs"],
  security: [{ userToken: [] }],
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Array(FAQSchema),
  },
};

export const getFAQsAdmin = {
  description: "Get all FAQs (Admin)",
  headers: Type.Ref(headersSchema),
  security: [{ adminToken: [] }],
  tags: ["FAQs"],
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Array(FAQSchema),
  },
};

const createFAQBody = Type.Object({
  title: LangObjectType,
  question: LangObjectType,
  answer: LangObjectType,
});
export const createFAQ = {
  description: "create faq",
  tags: ["FAQs"],
  security: [{ adminToken: [] }],
  body: createFAQBody,
  response: {
    201: FAQSchema,
  },
};

const updateFAQBody = Type.Object({
  title: Type.Optional(LangObjectType),
  question: Type.Optional(LangObjectType),
  answer: Type.Optional(LangObjectType),
});
export const updateFAQ = {
  description: "update faq",
  tags: ["FAQs"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  body: updateFAQBody,
  response: {
    200: FAQSchema,
  },
};

export const deleteFAQ = {
  description: "delete faq",
  tags: ["FAQs"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  response: {
    200: responseMessage,
  },
};
