import { RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { Banner } from "./banner.model";
import moment from "moment-timezone";
import { bannerResponse, createBannerDto, editBannerDto, IGetBanners, sortBannerDto } from "./banner.dto";
import { Op } from "sequelize";
import { orderCriteria } from "../../utils/common-methods";
import { Admin } from "../admin/admin.model";
import ProductService from "../product/product.service";
import CategoryService from "../category/category.service";
import VendorService from "../vendor/vendor.service";
import { FilterService } from "src/utils/filtering/filter-service";
import { Product } from "../product/product.model";
import { Category } from "../category/category.model";

const BannerService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterBanner: (search: IGetBanners) => {
			const filter = new FilterService();

			if (search.type) {
				filter.equals("type", search.type);
			}

			if (!search.isAdmin) {
				filter.dateInRange("from", undefined, new Date());
				filter.dateInRange("to", new Date());
			}

			return filter.build();
		},
	};
	const service = {
		getAll: async (dto: RequestData<IGetBanners>) => {
			const { request } = dto;
			const isAdmin = dto.request?.permission.isAdmin || false;
			const response = await Banner.findAndCountAll({
				where: privateMethods.filterBanner({ ...dto.data, isAdmin }),
				order: orderCriteria({ sortBy: "rank", sort: "ASC" }),
				include: [Admin, Product, Category],
			});

			return {
				count: response.count,
				rows: response.rows.map((banner) => {
					return bannerResponse(banner, dto.langCode, !!dto.request?.multiLang);
				}),
			};
		},

		getDetails: async (dto: RequestData<number>) => {
			const { data } = dto;
			const banner = await Banner.findByPk(data, {
				include: [Admin, Product, Category],
			});
			if (!banner) {
				throw instance.httpErrors.notFound("banner.response.notFound");
			}
			return bannerResponse(banner, dto.langCode, !!dto.request?.multiLang);
		},

		getAllAdmin: async (dto: RequestData<IGetBanners>) => {
			const { request } = dto;
			const isAdmin = dto.request?.permission.isAdmin || false;
			const response = await Banner.findAndCountAll({
				where: privateMethods.filterBanner({ ...dto.data, isAdmin: true }),
				order: orderCriteria({ sortBy: "rank", sort: "ASC" }),
				include: [Admin, Product, Category],
			});

			return {
				count: response.count,
				rows: response.rows.map((banner) => {
					return bannerResponse(banner, dto.langCode, true);
				}),
			};
		},

		getDetailsAdmin: async (dto: RequestData<number>) => {
			const { data } = dto;
			const banner = await Banner.findByPk(data, {
				include: [Admin, Product, Category],
			});
			if (!banner) {
				throw instance.httpErrors.notFound("banner.response.notFound");
			}
			return bannerResponse(banner, dto.langCode, true);
		},

		createBanner: async (dto: RequestData<createBannerDto>) => {
			// if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			let { data } = dto;
			const productService = ProductService(instance);
			const categoryService = CategoryService(instance);
			const vendorService = VendorService(instance);
			if (dto.data.productId) await productService.getOneProduct(dto.data.productId!);
			if (dto.data.categoryId) await categoryService.getOne(dto.data.categoryId);
			if (dto.data.vendorId) await vendorService.findById(dto.data.vendorId);
			const lastBanner = await Banner.findOne({
				where: {},
				order: orderCriteria({ sortBy: "rank", sort: "DESC" }),
			});

			const rank = lastBanner ? lastBanner.rank + 1 : 1;
			if (!data.vendorId || data.vendorId === 0) {
				delete data.vendorId;
			}
			if (!data.categoryId || data.categoryId === 0) {
				delete data.categoryId;
			}
			if (!data.categoryId || data.categoryId === 0) {
				delete data.categoryId;
			}
			if (!data.productId || data.productId === 0) {
				delete data.productId;
			}

			const banner = await Banner.create({
				...data,
				rank,
			});
			return banner;
		},

		editBanner: async (dto: RequestData<editBannerDto>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const productService = ProductService(instance);
			const categoryService = CategoryService(instance);
			const vendorService = VendorService(instance);
			if (dto.data.productId) await productService.getOneProduct(dto.data.productId!);
			if (dto.data.categoryId) await categoryService.getOne(dto.data.categoryId);
			if (dto.data.vendorId) await vendorService.findById(dto.data.vendorId);

			if (!dto.data.vendorId || dto.data.vendorId === 0) {
				delete dto.data.vendorId;
			}
			if (!dto.data.categoryId || dto.data.categoryId === 0) {
				delete dto.data.categoryId;
			}
			if (!dto.data.productId || dto.data.productId === 0) {
				delete dto.data.productId;
			}
			let { id, ...body } = dto.data;
			const banner = await Banner.findOne({
				where: {
					id,
				},
				include: [Admin],
			});

			if (!banner) {
				throw instance.httpErrors.notFound("banners.response.notFound");
			}

			if (!dto.data.vendorId || dto.data.vendorId === 0) {
				delete dto.data.vendorId;
			}
			if (!dto.data.categoryId || dto.data.categoryId === 0) {
				delete dto.data.categoryId;
			}
			if (!dto.data.categoryId || dto.data.categoryId === 0) {
				delete dto.data.categoryId;
			}
			if (!dto.data.productId || dto.data.productId === 0) {
				delete dto.data.productId;
			}
			const rank = banner.rank;
			await banner.update({ ...body, rank });

			return bannerResponse(banner, dto.langCode, dto.request.multiLang);
		},

		sortBanner: async (dto: RequestData<sortBannerDto>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const { banner } = dto.data;
			const dbBanner = await Banner.findAll({});

			const map = new Map<number, number>();
			banner.map((banner, index) => {
				map.set(banner, index + 1);
			});

			if (banner.length !== dbBanner.length) {
				throw instance.httpErrors.notFound("banners.response.notFound");
			}
			const transaction = await instance.db.transaction();
			try {
				for await (const banner of dbBanner) {
					if (!map.has(banner.id)) {
						throw instance.httpErrors.notFound("banners.response.notFound");
					}

					const rank = map.get(banner.id);

					await banner.update({ rank }, { transaction });
				}

				await transaction.commit();

				return dbBanner.sort((a, b) => a.rank - b.rank);
			} catch (err) {
				await transaction.rollback();
			}
		},

		removeBanner: async (dto: RequestData<number>) => {
			if (!dto.request?.permission.isAdmin) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const { data } = dto;
			await Banner.destroy({
				where: { id: data },
			});
			return {
				result: true,
			};
		},
	};
	return service;
};
export default BannerService;
