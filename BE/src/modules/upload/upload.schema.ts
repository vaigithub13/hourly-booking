import { Type } from "@sinclair/typebox";
import { CustomType, headersSchema } from "./../../utils/json-schema";
import { Multipart } from "@fastify/multipart";

export const uploadApi = {
  description: "Upload api",
  headers: Type.Ref(headersSchema),
  consumes: ["application/json", "multipart/form-data"],
  tags: ["Upload"],
  body: Type.Object({
    files: Type.Union([
      Type.Array(CustomType<Multipart>({ $ref: "#mySharedSchema" })),
      CustomType<Multipart>({ $ref: "#mySharedSchema" }),
    ]),
  }),
  response: {
    200: Type.Array(Type.String()),
  },
};
