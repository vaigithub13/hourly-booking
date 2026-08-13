import { LangObjectType } from "src/types/common-types";
import {
  PaginatedSchema,
  PaginationQuerySchema,
  SortDirectionEnum,
  deviceSchema,
  headersSchema,
} from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { VendorSortOptions } from "./vendor.dto";

export const vendorSchema = Type.Object({
  id: Type.Optional(Type.Number()),
  email: Type.Optional(Type.String()),
  phoneNumber: Type.Optional(Type.String()),
  vendorName: Type.Optional(Type.Any()),
  ownerName: Type.Optional(Type.Any()),
  logo: Type.Optional(Type.String()),
  rate: Type.Optional(Type.Number()),
  designerWallet: Type.Optional(Type.Number()),
  address: Type.Optional(
    Type.Object({
      unit: Type.String(),
      street: Type.String(),
      building: Type.String(),
      zone: Type.String(),
      longitude: Type.Optional(Type.Number()),
      latitude: Type.Optional(Type.Number()),
    })
  ),
  appPercentage: Type.Optional(Type.Number()),
  certificate: Type.Optional(Type.String()),
  username: Type.Optional(Type.String()),
  blocked: Type.Optional(Type.Boolean()),
  status: Type.Optional(Type.String()),
});

export const signup = {
  description: "signup",
  headers: Type.Ref(headersSchema),
  tags: ["Vendor"],
  body: Type.Object({
    email: Type.String(),
    phoneNumber: Type.String(),
    vendorName: LangObjectType,
    ownerName: LangObjectType,
    password: Type.String({ minLength: 8 }),
    logo: Type.String(),
    address: Type.Object({
      unit: Type.String(),
      street: Type.String(),
      building: Type.String(),
      zone: Type.String(),
      longitude: Type.Optional(Type.Number()),
      latitude: Type.Optional(Type.Number()),
    }),
    certificate: Type.String(),
    username: Type.String(),
    appPercentage: Type.Optional(Type.Number({ default: 0 })),
  }),
  response: {
    201: Type.Any(),
  },
};

export const getVendorByEmailOrPhone = {
  description: "Get vendor by email or phone",
  headers: Type.Ref(deviceSchema),
  tags: ["Vendor"],
  body: Type.Object({ emailOrPhone: Type.String() }),
  response: { 200: vendorSchema },
};

export const editProfile = {
  description: "vendor profile edit by himself",
  headers: Type.Ref(deviceSchema),
  tags: ["Vendor"],
  body: Type.Object({
    email: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    vendorName: Type.Optional(LangObjectType),
    ownerName: Type.Optional(LangObjectType),
    logo: Type.Optional(Type.String()),
    address: Type.Optional(
      Type.Object({
        unit: Type.String(),
        street: Type.String(),
        building: Type.String(),
        zone: Type.String(),
        longitude: Type.Optional(Type.Number()),
        latitude: Type.Optional(Type.Number()),
      })
    ),
    certificate: Type.Optional(Type.String()),
    username: Type.Optional(Type.String()),
  }),
  response: { 201: Type.Any() },
};

export const getVendorByToken = {
  description: "vendor profile edit by himself",
  headers: Type.Ref(deviceSchema),
  tags: ["Vendor"],
  body: Type.Object({
    token: Type.String(),
  }),
  response: { 200: Type.Any() },
};

// export const deleteVendorByAdmin = {
// 	description: "Delete vendor account by admin",
// 	headers: Type.Ref(headersSchema),
// 	security: [{ adminToken: [] }],
// 	tags: ["Vendor"],
// 	params: Type.Object({
// 		id: Type.Number(),
// 	}),
// 	response: { 200: responseMessage },
// };

export const getAllVendors = {
  description: "Get all vendors by admin",
  headers: Type.Ref(headersSchema),
  security: [{ adminToken: [] }],
  tags: ["Vendor"],
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    blocked: Type.Optional(Type.Boolean()),
    sortBy: Type.Optional(Type.Enum(VendorSortOptions)),
    sort: Type.Optional(Type.Optional(Type.Enum(SortDirectionEnum))),
    rate: Type.Optional(Type.Number()),
    ...PaginationQuerySchema,
  }),
  response: { 200: PaginatedSchema(vendorSchema) },
};
export const getVendorById = {
  description: "Get all vendors by admin",
  headers: Type.Ref(headersSchema),
  security: [{ adminToken: [] }],
  tags: ["Vendor"],
  params: Type.Object({
    id: Type.Number({ minimum: 1 }),
  }),
  response: { 200: vendorSchema },
};
