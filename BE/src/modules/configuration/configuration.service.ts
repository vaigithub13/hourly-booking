import { FastifyInstance } from "fastify";
import { Configuration } from "./configuration.model";
import { RequestData } from "./../../types/request";
import {
  EditGlobalConfigsDto,
  globalConfigsResponse,
} from "./configuration.dto";

const ConfigurationService = (instance: FastifyInstance) => {
  const service = {
    find: async () => {
      let configuration = await Configuration.findOne({});
      if (!configuration) {
        configuration = await service.create();
      }
      return configuration;
    },
    create: async () => {
      return await Configuration.create();
    },
    getGlobalConfigs: async (dto: RequestData<unknown>) => {
      const isAdmin = dto.request?.permission.isAdmin || false;
      const configs = await service.find();
      return globalConfigsResponse({
        configs,
        langCode: isAdmin ? undefined : dto.langCode,
      });
    },
    editGlobalConfigs: async (dto: RequestData<EditGlobalConfigsDto>) => {
      const configurations = await service.find();
      return await configurations.update({ ...dto.data });
    },
  };

  return service;
};

export default ConfigurationService;
