import {
  LangObjectType,
  idParamObject,
  responseMessage,
} from "../../types/common-types";
import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";

export const Locationschema = Type.Object({
  id: Type.Number(),
  zone: Type.String(),
  lat: Type.String(),
  lng: Type.String(),
  price: Type.Number(),
});

export const getLocations = {
  description: "Get all Locations",
  headers: Type.Ref(headersSchema),
  security: [{ userToken: [], adminToken: [] }],
  tags: ["Locations"],
  querystring: Type.Object({
    name: Type.Optional(Type.String()),
  }),
  response: {
    200: {
      locations: Type.Array(Locationschema),
    },
  },
};

const createLocationsBody = Type.Object({
  zone: Type.String(),
  //area: LangObjectType,
  lat: Type.String(),
  lng: Type.String(),
  price: Type.Number(),
});
export const createLocations = {
  description: "create Locations",
  tags: ["Locations"],
  security: [{ adminToken: [] }],
  body: createLocationsBody,
  response: {
    201: {
      location: Locationschema,
    },
  },
};

const updateLocationsBody = Type.Object({
  zone: Type.Optional(Type.String()),
  //area: Type.Optional(LangObjectType),
  lat: Type.Optional(Type.String()),
  lng: Type.Optional(Type.String()),
  price: Type.Optional(Type.Number()),
});
export const updateLocations = {
  description: "update Locations",
  tags: ["Locations"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  body: updateLocationsBody,
  response: {
    200: {
      location: Locationschema,
    },
  },
};

export const deleteLocations = {
  description: "delete Locations",
  tags: ["Locations"],
  security: [{ adminToken: [] }],
  params: idParamObject,
  response: {
    200: {
      result: Type.Boolean(),
    },
  },
};
