import { RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { CustomAttributes, SKUCustomAttributes } from "./custom_attributes.model";
import {
	CustomAttributesResponse,
	IFilterCustomAttributes,
	createCustomAttributesDto,
	customAttributesResponse,
	editCustomAttributesDto,
} from "./custom_attributes.dto";
import { SKU } from "../product/product.model";
import { AttributeEnum } from "src/types/enums";
import { Op } from "sequelize";

const CustomAttributesService = (instance: FastifyInstance) => {
	const service = {
		getColorById: async (id: number) => {
			const color = await CustomAttributes.findOne({ where: { type: AttributeEnum.color, id } });
			if (!color) throw instance.httpErrors.badRequest("Color Not Found");
			return color;
		},
		getMultipleColorsById: async (ids: number[]) => {
			const color = await CustomAttributes.findAll({ where: { type: AttributeEnum.color, id: { [Op.in]: ids } } });
			if (color.length !== ids.length) throw instance.httpErrors.badRequest("Some Colors Not Found");
			return color;
		},
		getLengthById: async (id: number) => {
			const length = await CustomAttributes.findOne({ where: { type: AttributeEnum.length, id } });
			if (!length) throw instance.httpErrors.badRequest("Length Not Found");
			return length;
		},
		getSizeById: async (id: number) => {
			const size = await CustomAttributes.findOne({ where: { type: AttributeEnum.size, id } });
			if (!size) throw instance.httpErrors.badRequest("Size Not Found");
			return size;
		},
		getAllColors: async () => {
			return await CustomAttributes.findAll({ where: { type: AttributeEnum.color } });
		},
		getAllSizes: async () => {
			return await CustomAttributes.findAll({ where: { type: AttributeEnum.size } });
		},
		getAllLengths: async () => {
			return await CustomAttributes.findAll({ where: { type: AttributeEnum.length } });
		},
		getAll: async (dto: RequestData<IFilterCustomAttributes>) => {
			const isAdminOrVendor = dto.request?.permission.isAdmin || dto.request?.permission.isVendor || false;
			const { request } = dto;
			const option = dto.data.type
				? {
						type: dto.data.type,
				  }
				: {};
			const response = await CustomAttributes.findAndCountAll({
				where: option,
				order: [["id", "ASC"]],
			});
			return {
				count: response.count,
				rows: response.rows.map((CustomAttributes) => {
					return CustomAttributesResponse(CustomAttributes, dto.langCode, isAdminOrVendor);
				}),
			};
		},

		createCustomAttributes: async (dto: RequestData<createCustomAttributesDto>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const { data } = dto;

			const customAttributes = await CustomAttributes.create({
				...data,
			});
			return customAttributes;
		},

		editCustomAttributes: async (dto: RequestData<editCustomAttributesDto>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
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
			return CustomAttributesResponse(customAttributes, dto.langCode, dto.request!.permission.isAdmin);
		},

		removeCustomAttributes: async (dto: RequestData<number>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
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
