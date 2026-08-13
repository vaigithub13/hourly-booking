import { Nullable } from "./../../utils/json-schema/index";
import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "../../utils/json-schema";
import { BannerType, bannerType } from "./banner.dto";
import { vendorAdminSchema } from "../admin/admin.schema";

export const BannerDto = Type.Object({
  id: Type.Optional(Type.Number()),
  image: Type.String(),
  url: Type.String(),
  vendor: Nullable(Type.Any()),
  category: Nullable(Type.Any()),
  product: Nullable(Type.Any()),
  type: Type.Optional(Type.String()),
  title: Type.Optional(
    Type.Union([
      Type.Object({
        en: Type.String(),
        ar: Type.String(),
      }),
      Type.String(),
    ])
  ),
  from: Type.Optional(Type.String({ format: "date-time" })),
  to: Type.Optional(Type.String({ format: "date-time" })),
});

export const BannersResponse = Type.Object({
  count: Type.Number(),
  rows: Type.Array(BannerDto),
});

const sortByOptions = StringEnum(["id"]);
const sortDirection = StringEnum(["desc", "asc"]);

export const getBanners = {
  description: "get all banners  {} ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  querystring: Type.Object({
    // type: Type.Optional(Type.String({ description: "offer or Normal" })),
    // isSortAsc: Type.Optional(Type.Boolean({ description: "" })),
    type: Type.Optional(Type.Enum(BannerType)),
    // isSortDesc: Type.Optional(Type.Boolean({ description: "" })),
  }),
  response: {
    200: {
      count: Type.Number(),
      rows: Type.Array(BannerDto),
    },
  },
};

export const getBannerById = {
  description: "get banner by id {} ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  params: Type.Object({
    id: Type.Number(),
  }),
  response: {
    200: BannerDto,
  },
};

export const getBannersForAdmin = {
  description: "get all banners  {} ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  querystring: Type.Object({
    // type: Type.Optional(Type.String({ description: "offer or Normal" })),
    // isSortAsc: Type.Optional(Type.Boolean({ description: "" })),
    // isSortDesc: Type.Optional(Type.Boolean({ description: "" })),
    type: Type.Optional(Type.Enum(BannerType)),
  }),
  response: {
    200: {
      count: Type.Number(),
      rows: Type.Array(BannerDto),
    },
  },
};

export const getBannerByIdForAdmin = {
  description: "get banner by id {} ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  params: Type.Object({
    id: Type.Number(),
  }),
  response: {
    200: BannerDto,
  },
};

export const createBanner = {
  description: "create banner  { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  body: Type.Object({
    url: Type.Optional(Type.String()),
    image: Type.String(),
    type: Type.Optional(Type.Enum(BannerType)),
    vendorId: Type.Optional(Type.Number({ default: null })),
    productId: Type.Optional(Type.Number({ default: null })),
    categoryId: Type.Optional(Type.Number({ default: null })),
    title: Type.Object({
      en: Type.String(),
      ar: Type.String(),
    }),
    from: Type.String({ format: "date-time" }),
    to: Type.String({ format: "date-time" }),
  }),
  // response: {
  //     200: BannerDto,
  // },
};

export const editBanner = {
  description: "edit banner { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    image: Type.String(),
    url: Type.Optional(Type.String()),
    vendorId: Type.Optional(Type.Number({ default: null })),
    productId: Type.Optional(Type.Number({ default: null })),
    categoryId: Type.Optional(Type.Number({ default: null })),
    type: Type.Optional(Type.Enum(BannerType)),
    title: Type.Optional(
      Type.Object({
        en: Type.String(),
        ar: Type.String(),
      })
    ),
    from: Type.String({ format: "date-time" }),
    to: Type.String({ format: "date-time" }),
  }),
  response: {
    200: BannerDto,
  },
};

export const sortBanner = {
  description: "sort banners { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  params: Type.Object({}),
  body: Type.Object({
    banner: Type.Array(Type.Number(), { uniqueItems: true }),
  }),
  // response: {
  //     200: BannerDto,
  // },
};

export const removeBanner = {
  description: "remove banner { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Banner"],
  security: [{ adminToken: [] }],
  params: Type.Object({
    id: Type.Number(),
  }),
  response: {
    200: {
      result: Type.Boolean(),
    },
  },
};
