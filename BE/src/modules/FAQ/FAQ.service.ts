import { FastifyInstance } from "fastify";
import { FAQ } from "./FAQ.model";
import { FAQDto, FAQResponse } from "./dto";
import { PaginatedRequest, RequestData } from "src/types/request";
import { JObject } from "src/types/common-types";

const FAQService = (instance: FastifyInstance) => {
  //methods start with find will use only for communication between services

  const service = {
    findById: async (id: number) => {
      const faq = await FAQ.findOne({ where: { id } });

      if (!faq) {
        throw instance.httpErrors.badRequest("faq.response.notFound");
      }

      return faq;
    },
    findByIdWithoutExp: async (id: number) => {
      const faq = await FAQ.findOne({ where: { id } });

      return faq;
    },

    getAllFAQs: async (dto: PaginatedRequest<undefined>) => {
      const query = dto.request.query as JObject;
      const { limit, offset, request, langCode } = dto;
      const response = await FAQ.findAndCountAll({
        limit: limit,
        offset: offset,
        where: {},
      });

      return {
        count: response.count,
        rows: response.rows.map((el) =>
          FAQResponse(el, langCode, request.multiLang)
        ),
      };
    },
    addOrUpdateFAQ: async (dto: RequestData<FAQDto>) => {
      const { data, request, langCode } = dto;

      if (!request?.permission.isAdmin) {
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      }

      let faq: FAQ;

      if (data.id) {
        faq = await service.findById(data.id);

        await faq.update({ ...data });
      } else {
        faq = new FAQ({ ...data });

        await faq.save();
      }

      return FAQResponse(faq, langCode, request.multiLang);
    },
    deleteById: async (dto: RequestData<number>) => {
      const { data, request } = dto;

      if (!request?.permission.isAdmin) {
        throw instance.httpErrors.unauthorized("common.response.unauthorized");
      }

      const faq = await service.findById(data);

      await faq.destroy();

      return {
        message: "common.response.success",
      };
    },
  };

  return service;
};

export default FAQService;
