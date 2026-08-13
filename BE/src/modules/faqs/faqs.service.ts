import { FastifyInstance } from "fastify";
import { FAQ } from "./faqs.model";
import { RequestData } from "./../../types/request";
import { CreateFAQ, GetFaqsQuery, UpdateFAQ, faqResponse } from "./faqs.dto";
import { translateMessage } from "./../../utils/common-methods";
import constants from "./../../utils/constants/shared-constants";
import { FaqsFilterService } from "./utils/faqs.filter-service";

const FAQsService = (instance: FastifyInstance) => {
  const privateMethods = {
    findFaqsFilter: (query: GetFaqsQuery) => {
      const { search } = query;
      const filters = new FaqsFilterService();
      if (search) {
        filters
          .substringLangObject("title", search)
          .substringLangObject("question", search);
      }
      return filters.build();
    },
  };
  const service = {
    findByPk: async (id: number) => {
      const faq = await FAQ.findByPk(id);
      if (!faq) {
        throw instance.httpErrors.notFound("faq.response.notFound");
      }
      return faq;
    },

    findAll: async (dto: RequestData<GetFaqsQuery>) => {
      const query = dto.data;
      const faqs = await FAQ.findAll({
        where: privateMethods.findFaqsFilter(query),
      });
      return faqs.map((faq) =>
        faqResponse(faq, dto.langCode, dto.request?.permission.isAdmin)
      );
    },

    adminFindAll: async (dto: RequestData<GetFaqsQuery>) => {
      const query = dto.data;
      const faqs = await FAQ.findAll({
        where: privateMethods.findFaqsFilter(query),
      });
      return faqs.map((faq) =>
        faqResponse(faq, dto.langCode, dto.request?.permission.isAdmin)
      );
    },

    create: async (dto: RequestData<CreateFAQ>) => {
      const faq = await FAQ.create({ ...dto.data });
      return faqResponse(faq, dto.langCode, dto.request?.permission.isAdmin);
    },

    update: async (dto: RequestData<UpdateFAQ>) => {
      const faq = await service.findByPk(dto.data.id);
      await faq.update({ ...dto.data });
      return faqResponse(faq, dto.langCode, dto.request?.permission.isAdmin);
    },

    delete: async (dto: RequestData<number>) => {
      const faq = await service.findByPk(dto.data);
      await faq.destroy();
      return {
        message: translateMessage("faq.response.deleted", dto.langCode),
      };
    },
  };
  return service;
};

export default FAQsService;
