import { FastifyInstance } from "fastify";
import { ProductLength } from "./product-length.model";
import { RequestData } from "../../types/request";
import {
  ICreateProductLength,
  IGetProductLengthsQuery,
  IUpdateProductLength,
  productLengthResponse,
} from "./product-length.dto";
import { translateMessage } from "../../utils/common-methods";
import { ProductLengthFilterService } from "./utils/product-length.filter-service";

const ProductLengthsService = (instance: FastifyInstance) => {
  const privateMethods = {
    findProductLengthsFilter: (query: IGetProductLengthsQuery) => {
      const { available } = query;
      const filters = new ProductLengthFilterService();
      if (available !== undefined) filters.equals("available", available);
      return filters.build();
    },
  };
  const service = {
    findByPk: async (data: { id: number; throwError?: boolean }) => {
      const throwError = data.throwError || true;
      const length = await ProductLength.findByPk(data.id);
      if (!length && throwError) throw instance.httpErrors.notFound();
      return length;
    },

    findAll: async (dto: RequestData<IGetProductLengthsQuery>) => {
      const query = dto.data;
      const lengths = await ProductLength.findAll({
        where: privateMethods.findProductLengthsFilter(query),
      });
      return lengths.map((length) => productLengthResponse(length));
    },

    create: async (dto: RequestData<ICreateProductLength>) => {
      const length = await ProductLength.create({ ...dto.data });
      return productLengthResponse(length);
    },

    update: async (dto: RequestData<IUpdateProductLength>) => {
      const length = (await service.findByPk({
        id: dto.data.id,
      })) as ProductLength;
      await length.update({ ...dto.data });
      return productLengthResponse(length);
    },

    delete: async (dto: RequestData<number>) => {
      const length = (await service.findByPk({
        id: dto.data,
      })) as ProductLength;
      await length.destroy();
      return {
        message: translateMessage("faq.response.deleted", dto.langCode),
      };
    },
  };
  return service;
};

export default ProductLengthsService;
