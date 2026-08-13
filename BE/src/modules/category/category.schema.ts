import { headersSchema } from "../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "../../utils/json-schema";
import { responseMessage } from "src/types/common-types";

export const CategoryDto = Type.Object({
  id: Type.Optional(Type.Number()),
  image: Type.String(),
  isRequiredLength: Type.Optional(Type.Boolean()),
  name: Type.Optional(
    Type.Union([
      Type.Object({
        en: Type.String(),
        ar: Type.String(),
      }),
      Type.String(),
    ])
  ),
});

export const CategoryResponse = Type.Object({
  count: Type.Number(),
  rows: Type.Array(CategoryDto),
});

export const getCategory = {
  description: "get all Category  {} ",
  headers: Type.Ref(headersSchema),
  security: [{ adminToken: [] }],
  tags: ["Category"],
  response: {
    200: {
      count: Type.Number(),
      rows: Type.Array(CategoryDto),
    },
  },
};

// export const getCategoryById = {
// 	description: "get Category by id {} ",
// 	headers: Type.Ref(headersSchema),
// 	tags: ["Category"],
// 	params: Type.Object({
// 		id: Type.Number(),
// 	}),
// 	response: {
// 		200: CategoryDto,
// 	},
// };

export const createCategory = {
  description: "create Category  { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Category"],
  security: [{ adminToken: [] }],
  body: Type.Object({
    image: Type.String(),
    name: Type.Object({
      en: Type.String(),
      ar: Type.String(),
    }),
    isRequiredLength: Type.Boolean(),
  }),
  // response: {
  //     200: CategoryDto,
  // },
};

export const editCategory = {
  description: "edit Category { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Category"],
  security: [{ adminToken: [] }],
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    image: Type.String(),
    name: Type.Object({
      en: Type.String(),
      ar: Type.String(),
    }),
    isRequiredLength: Type.Optional(Type.Boolean()),
  }),
  response: {
    200: CategoryDto,
  },
};

export const removeCategory = {
  description: "remove Category { admin token } ",
  headers: Type.Ref(headersSchema),
  tags: ["Category"],
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
