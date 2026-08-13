import { idParamObject, responseMessage } from "../../types/common-types";
import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";

const ProductLengthSchema = Type.Object({
  id: Type.Number(),
  length: Type.Number(),
  available: Type.Boolean(),
});

export const getProductLengths = {
  description: "Get all product lengths",
  headers: Type.Ref(headersSchema),
  tags: ["Product Lengths"],
  querystring: Type.Object({
    available: Type.Optional(Type.Boolean()),
  }),
  response: {
    200: Type.Array(ProductLengthSchema),
  },
};

const createProductLengthBody = Type.Object({
  length: Type.Number(),
  available: Type.Optional(Type.Boolean({ default: true })),
});

export const createProductLength = {
  description: "Create product length",
  tags: ["Product Lengths"],
  security: [{ adminToken: [] }],
  body: createProductLengthBody,
  response: {
    201: ProductLengthSchema,
  },
};

const updateProductLengthBody = Type.Object({
  length: Type.Optional(Type.Number()),
  available: Type.Optional(Type.Boolean({ default: true })),
});

export const updateProductLength = {
  description: "Update product length",
  tags: ["Product Lengths"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  body: updateProductLengthBody,
  response: {
    200: ProductLengthSchema,
  },
};

export const deleteProductLength = {
  description: "Delete product length",
  tags: ["Product Lengths"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  response: {
    200: responseMessage,
  },
};
