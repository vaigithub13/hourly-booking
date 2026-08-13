import { FastifyInstance } from "fastify";
import { Blogger } from "./blogger.model";
import { RequestData } from "../../types/request";
import { CreateBlogger, GetBloggersQuery, UpdateBlogger, bloggerResponse } from "./blogger.dto";
import { translateMessage } from "../../utils/common-methods";
import constants from "../../utils/constants/shared-constants";
import { BloggersFilterService } from "./utils/blogger.filter-service";
import ProductService from "../product/product.service";
import { Product } from "../product/product.model";

const BloggersService = (instance: FastifyInstance) => {
	const privateMethods = {
		findBloggersFilter: (query: GetBloggersQuery) => {
			const { search } = query;
			const filters = new BloggersFilterService();
			if (search) {
				filters.substringLangObject("name", search);
			}
			return filters.build();
		},
	};
	const service = {
		findByPk: async (id: number) => {
			const blogger = await Blogger.findByPk(id);
			if (!blogger) {
				throw instance.httpErrors.notFound("blogger.response.notFound");
			}
			return blogger;
		},

		findAll: async (dto: RequestData<GetBloggersQuery>) => {
			const query = dto.data;
			const bloggers = await Blogger.findAll({
				where: privateMethods.findBloggersFilter(query),
			});
			return bloggers.map((blogger) => bloggerResponse(blogger, dto.langCode, dto.request?.permission.isAdmin));
		},

		adminFindAll: async (dto: RequestData<GetBloggersQuery>) => {
			const query = dto.data;
			const bloggers = await Blogger.findAll({
				where: privateMethods.findBloggersFilter(query),
			});
			return bloggers.map((blogger) => bloggerResponse(blogger, dto.langCode, dto.request?.permission.isAdmin));
		},

		create: async (dto: RequestData<CreateBlogger>) => {
			const blogger = await Blogger.create({ ...dto.data });
			return bloggerResponse(blogger, dto.langCode, dto.request?.permission.isAdmin);
		},

		update: async (dto: RequestData<UpdateBlogger>) => {
			const blogger = await service.findByPk(dto.data.id);
			await blogger.update({ ...dto.data });
			return bloggerResponse(blogger, dto.langCode, dto.request?.permission.isAdmin);
		},

		delete: async (dto: RequestData<number>) => {
			const blogger = await service.findByPk(dto.data);
			await blogger.destroy();
			return {
				message: translateMessage("blogger.response.deleted", dto.langCode),
			};
		},

		assignProduct: async (dto: RequestData<{ productId: number; bloggerId }>) => {
			const blogger = await Blogger.findOne({ where: { id: dto.data.bloggerId } });
			if (!blogger) {
				throw instance.httpErrors.notFound('not found blogger');
			}
			const productService = ProductService(instance);
			// const product = await productService.findSkuById();
			// if (!product) {
			// 	throw instance.httpErrors.notFound('not found blogger');
			// }
		},
	};
	return service;
};

export default BloggersService;
