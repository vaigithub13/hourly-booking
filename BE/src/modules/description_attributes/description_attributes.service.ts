import { RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import {
  CustomAttributes,
  SKUCustomAttributes,
} from "./custom_attributes.model";
import {
  CustomAttributesResponse,
  IFilterCustomAttributes,
  createCustomAttributesDto,
  customAttributesResponse,
  editCustomAttributesDto,
} from "./custom_attributes.dto";
import { SKU } from "../product/product.model";

const CustomAttributesService = (instance: FastifyInstance) => {
  const service = {
    getAll: async (dto: RequestData<IFilterCustomAttributes>) => {
      const isAdminOrVendor =
        dto.request?.permission.isAdmin ||
        dto.request?.permission.isVendor ||
        false;
      const { request } = dto;
      const option = dto.data.type
        ? {
            type: dto.data,
          }
        : {};
      const response = await CustomAttributes.findAndCountAll({
        where: option,
        order: [["id", "DESC"]],
      });
      return {
        count: response.count,
        rows: response.rows.map((CustomAttributes) => {
          return CustomAttributesResponse(
            CustomAttributes,
            dto.langCode,
            isAdminOrVendor
          );
        }),
      };
    },

    createCustomAttributes: async (
      dto: RequestData<createCustomAttributesDto>
    ) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { data } = dto;

      const customAttributes = await CustomAttributes.create({
        ...data,
      });
      return customAttributes;
    },

    editCustomAttributes: async (dto: RequestData<editCustomAttributesDto>) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { id, ...body } = dto.data;
      const customAttributes = await CustomAttributes.findOne({
        where: {
          id,
        },
      });

      if (!customAttributes) {
        throw instance.httpErrors.notFound("common.response.notFound");
      }

      await customAttributes.update({ ...body });
      await customAttributes.reload();
      return CustomAttributesResponse(
        customAttributes,
        dto.langCode,
        dto.request!.permission.isAdmin
      );
    },

    removeCustomAttributes: async (dto: RequestData<number>) => {
      if (!dto.request?.permission.isAdmin)
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      const { data } = dto;
      await SKUCustomAttributes.destroy({
        where: { CustomAttributesId: data },
      });
      await CustomAttributes.destroy({
        where: { id: data },
      });
      return {
        result: true,
      };
    },
  };
  return service;
};
export default CustomAttributesService;
