import { RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { Category } from "./category.model";
import {
  CategoryResponse,
  createCategoryDto,
  editCategoryDto,
} from "./category.dto";

const CategoryService = (instance: FastifyInstance) => {
  const service = {
    checkCategoriesExisting: async (data: { ids: number[] }) => {
      const ids = data.ids;
      return await Promise.all(
        ids.map(async (id) => {
          const category = await Category.findByPk(id);
          if (!category)
            throw instance.httpErrors.notFound("category.response.notFound!");
        })
      );
    },
    getOne: async (id: number) => {
      const category = await Category.findOne({ where: { id } });
      if (!category) {
        throw instance.httpErrors.notFound("category.response.notFound");
      }
      return category;
    },

    getAll: async (dto: RequestData<undefined>) => {
      const { request } = dto;
      const isAdminOrVendor =
        dto.request?.permission.isAdmin ||
        dto.request?.permission.isVendor ||
        false;
      const response = await Category.findAndCountAll({
        order: [["id", "DESC"]],
      });
      return {
        count: response.count,
        rows: response.rows.map((category) => {
          return CategoryResponse(category, dto.langCode, isAdminOrVendor);
        }),
      };
    },

    createCategory: async (dto: RequestData<createCategoryDto>) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { data } = dto;

      const banner = await Category.create({
        ...data,
      });
      return banner;
    },

    editCategory: async (dto: RequestData<editCategoryDto>) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { id, ...body } = dto.data;
      const category = await Category.findOne({
        where: {
          id,
        },
      });

      if (!category) {
        throw instance.httpErrors.notFound("common.response.notFound");
      }

      await category.update({ ...body });
      await category.reload();
      return CategoryResponse(
        category,
        dto.langCode,
        dto.request!.permission.isAdmin
      );
    },

    removeCategory: async (dto: RequestData<number>) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { data } = dto;
      await Category.destroy({
        where: { id: data },
      });
      return {
        result: true,
      };
    },
  };
  return service;
};
export default CategoryService;
