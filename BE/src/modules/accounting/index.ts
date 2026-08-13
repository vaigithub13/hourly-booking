import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import AccountingService from "./accounting.service";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import * as schema from "./accounting.schema";
import { buildPaginationRequest, buildRequest } from "../../types/request";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const categoryService = AccountingService(fastify);

  instance.get(
    "/get-all",
    {
      preValidation: instance.auth([instance.authenticate], {
        relation: "and",
      }),
      schema: schema.getAllAccountings,
    },
    async (request: FastifyRequestTypebox<typeof schema.getAllAccountings>) => {
      const langCode = request.headers["x-lang"];
      const { limit, offset } = request.query;
      return await categoryService.getAllAccountings(
        buildPaginationRequest(limit, offset, langCode, request, request.query)
      );
    }
  );

  instance.get(
    "/accounting/:accountingId",
    {
      preValidation: instance.auth([instance.authenticate], {
        relation: "and",
      }),
      schema: schema.getAccountingById,
    },
    async (request: FastifyRequestTypebox<typeof schema.getAccountingById>) => {
      const langCode = request.headers["x-lang"];
      return await categoryService.getAccountingById(
        request.params.accountingId,
        langCode
      );
    }
  );

  instance.get(
    "/accounting-data/:vendorId",
    {
      preValidation: instance.auth([instance.authenticate], {
        relation: "and",
      }),
      schema: schema.vendorAccounting,
    },
    async (request: FastifyRequestTypebox<typeof schema.vendorAccounting>) => {
      const langCode = request.headers["x-lang"];
      const { limit, offset } = request.query
      return await categoryService.vendorAccounting(
        buildPaginationRequest(
          limit,
          offset,
          request.headers["x-lang"],
          request,
          request.params.vendorId,
        )
      );
    }
  );

  instance.get(
    "/accounting-all-data",
    {
      preValidation: instance.auth([instance.authenticate], {
        relation: "and",
      }),
      schema: schema.vendorAccountingForAll,
    },
    async (request: FastifyRequestTypebox<typeof schema.vendorAccountingForAll>) => {
      const langCode = request.headers["x-lang"];
      const { limit, offset } = request.query;
      return await categoryService.vendorAccountingForAll(
        buildPaginationRequest(limit, offset, langCode, request, request.query)
      );
    }
  );
};
