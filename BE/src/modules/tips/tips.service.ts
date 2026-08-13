import { FastifyInstance } from "fastify";
import { RequestData } from "../../types/request";
import { Tips } from "./tips.model";
import { EditTips } from "./tips.dto";
const TipsService = (instance: FastifyInstance) => {
	const service = {
		find: async () => {
			let tip = await Tips.findOne({});
			if (!tip) {
				tip = await service.create();
			}
			return tip;
		},
		create: async () => {
			return await Tips.create();
		},
		getGlobalConfigs: async (dto: RequestData<unknown>) => {
			const tips =  await service.find();
			const isAdmin = dto.request?.permission.isAdmin || false;
			return tips
		},

		editGlobalConfigs: async (dto: RequestData<EditTips>) => {
			const tips = await service.find();
			return await tips.update({ ...dto.data });
		},
	};

	return service;
};

export default TipsService;
