import { FastifyInstance } from "fastify";
import cron from "node-cron";
import { cronJobs } from "./cron-jobs";
import { getFastifyInstance } from "src/fastifyInstance";
import ConfigurationService from "src/modules/configuration/configuration.service";

export const registerJobs = async () => {
  const fastifyInstance = getFastifyInstance();
  const globalConfigsService = ConfigurationService(fastifyInstance);
  const globalConfigs = await globalConfigsService.find();

  // We don't need it because we changed the requirements of cancelling the order (we may need it later)
  // const cronJobRepeatPattern = `*/30 * * * *`;
  // cron.schedule(cronJobRepeatPattern, cronJobs.acceptOrdersCancellation);
};
