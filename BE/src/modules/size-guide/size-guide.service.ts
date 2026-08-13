import { FastifyInstance } from "fastify";
import { RequestData } from "../../types/request";
import { SizeGuide } from "./size-guide.model";
import { EditSizeGuidesDto } from "./size-guide.dto";
const SizeGuideService = (instance: FastifyInstance) => {
	const service = {
		find: async () => {
			let sizeGuide = await SizeGuide.findOne({});
			if (!sizeGuide) {
				sizeGuide = await service.create();
			}
			return sizeGuide;
		},
		create: async () => {
			return await SizeGuide.create();
		},
		getGlobalConfigs: async (dto: RequestData<unknown>) => {
			const size =  await service.find();
			const isAdmin = dto.request?.permission.isAdmin || false;
			return {
				...size.dataValues,
				description: isAdmin ? size.description: size.description?.[dto.langCode || 'en'] || null,
			}
		},

		editGlobalConfigs: async (dto: RequestData<EditSizeGuidesDto>) => {
			const sizeGuides = await service.find();
			return await sizeGuides.update({ ...dto.data });
		},
	};

	return service;
};

export default SizeGuideService;
