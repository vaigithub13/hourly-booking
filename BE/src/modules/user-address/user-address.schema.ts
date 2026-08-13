import { idParamObject, responseMessage } from "../../types/common-types";
import {
  deviceSchema,
  headersSchema,
  PaginationQuerySchema,
} from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";

export const userAddressSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  zone: Type.String(),
  street: Type.String(),
  buildingInfo: Type.String(),
  insideDoha: Type.Boolean(),
  isDefault: Type.Boolean(),
  description: Type.Optional(Type.String()),
  unit: Type.Optional(Type.String()),
  lat: Type.String(),
  lng: Type.String(),
  userId: Type.Number(),
});

export const getMyAddresses = {
  description: "Get My Addresses (For user)",
  headers: Type.Ref(deviceSchema),
  tags: ["UserAddresses"],
  security: [{ userToken: [] }],
  querystring: Type.Object({
    ...PaginationQuerySchema,
  }),
  response: {
    200: Type.Array(userAddressSchema),
  },
};

const createUserAddressBody = Type.Object({
  title: Type.String(),
  zone: Type.String(),
  street: Type.String(),
  description: Type.Optional(Type.String()),
  buildingInfo: Type.String(),
  isDefault: Type.Boolean(),
  unit: Type.Optional(Type.String()),
  lat: Type.String(),
  lng: Type.String(),
});

export const createUserAddress = {
  description: "Create a new User Address",
  tags: ["UserAddresses"],
  security: [{ userToken: [] }],
  body: createUserAddressBody,
  response: {
    201: userAddressSchema,
  },
};

const updateUserAddressBody = Type.Object({
  title: Type.Optional(Type.String()),
  zone: Type.Optional(Type.String()),
  street: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  isDefault: Type.Optional(Type.Boolean()),
  buildingInfo: Type.Optional(Type.String()),
  unit: Type.Optional(Type.String()),
  lat: Type.Optional(Type.String()),
  lng: Type.Optional(Type.String()),
});

export const updateUserAddress = {
  description: "Update an existing User Address",
  tags: ["UserAddresses"],
  security: [{ userToken: [] }],
  params: idParamObject,
  body: updateUserAddressBody,
  response: {
    200: userAddressSchema,
  },
};

export const deleteUserAddress = {
  description: "Delete User Address",
  tags: ["UserAddresses"],
  headers: Type.Ref(deviceSchema),
  security: [{ userToken: [] }],
  params: idParamObject,
  response: {
    200: responseMessage,
  },
};
