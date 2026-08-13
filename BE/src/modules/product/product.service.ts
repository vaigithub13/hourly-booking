import { PaginatedRequest, RequestData } from "../../types/request";
import { FastifyInstance } from "fastify";
import { Product, ProductCategory, ProductSupportedAttributes, SKU } from "./product.model";
import {
	ProductResponse,
	IProductSearch,
	ProductDataResponse,
	INewProduct,
	ISizeColor,
	IEditProduct,
	ISKUObject,
	WashingInstructions,
	IroningInstructions,
	Fabric,
	ProductType,
} from "./product.dto";
import { VendorFilterService } from "./utils/vendor.filter-service";
import { FindOptions, GroupOption, Includeable, Op, Order, Sequelize, Transaction, WhereAttributeHash, WhereOptions } from "sequelize";
import { Category } from "../category/category.model";
import { orderCriteria, translateMessage } from "src/utils/common-methods";
import { Admin } from "../admin/admin.model";
import { AdminRole } from "../admin/utils/admin.enum";
import { CustomAttributes, SKUCustomAttributes } from "../custom_attributes/custom_attributes.model";
import CategoryService from "../category/category.service";
import { AdminFilterService } from "../admin/utils/admin.filter-service";
import { Vendor } from "../vendor/vendor.model";
import { UserTypeEnum } from "src/types/common-types";
import { VendorStatus } from "../admin/admin.dto";
import CustomAttributesService from "../custom_attributes/custom_attributes.service";
import { AttributeEnum } from "src/types/enums";
import ProductLengthsService from "../product-length/product-length.service";

const ProductService = (instance: FastifyInstance) => {
	const privateMethods = {
		filterProducts: (search: IProductSearch): [WhereAttributeHash<any>, WhereAttributeHash<any>] => {
			const filters = new VendorFilterService();
			const skuFilter = new VendorFilterService();
			if (search.vendorId) filters.equals("vendorId", search.vendorId);
			if (search.serial) if (search.sku) skuFilter.equals("code", search.sku);
			if (search.name) {
				filters.substringLangObjectOR("name", search.name, true);
				filters.startsWith("serial", search.name, true);
			}
			if (search.approved !== undefined) filters.equals("approved", search.approved);
			if (search.readyToShip !== undefined) filters.equals("readyToShip", search.readyToShip);
			if (search.minPrice) filters.numberBetween("price", search.minPrice, undefined);
			if (search.maxPrice) filters.numberBetween("price", undefined, search.maxPrice);

			if (search.isDiscounted) filters.notEquals("discountedPrice", 0);
			return [filters.build(), skuFilter.build()];
		},
		getOneProduct: async (id: number) => {
			const product = await Product.findOne({
				where: {
					id,
				},
				include: [
					{ model: ProductSupportedAttributes, include: [CustomAttributes] },
					{
						model: SKU,
						required: false,
						include: [CustomAttributes],
					},
					{
						model: Admin,
						// include: [User]
					},
					Category,
				],
			});
			if (!product) throw instance.httpErrors.notFound("common.response.notFound");
			return product;
		},
		// getLastestSerial: async (vendorId: number): Promise<number> => {
		// 	const latestSerial = await SKU.max('serial',
		// 		{
		// 			where: {
		// 				vendorId
		// 			}
		// 		}
		// 	);
		// 	return (latestSerial as number) || 0; // Return 0 if no serial exists yet
		// },
		getAttributes: async (ids: number[]) => {
			return CustomAttributes.findAll({
				where: { id: { [Op.in]: ids } },
			});
		},
		buildSKU: async (
			vendorName: string,
			// categoryName: string,
			sizesAndColors: ISizeColor[],
			serial: string,
			productId?: number
		) => {
			if (!sizesAndColors.length) throw instance.httpErrors.conflict("Sizes and colors are required");

			const vendorCode = vendorName.slice(0, 2).toUpperCase();
			// const categoryCode = categoryName.slice(0, 3).toUpperCase();
			const serialNumber = serial.slice(0, 4).toUpperCase();

			const colorIds = sizesAndColors.map((SC) => SC.colorId);
			const sizeIds = sizesAndColors.map((SC) => SC.sizeId);
			const lengthIds = sizesAndColors.map((SC) => SC.lengthId);
			const [allColors, allSizes, allLengths] = await Promise.all([
				privateMethods.getAttributes(colorIds),
				privateMethods.getAttributes(sizeIds),
				privateMethods.getAttributes(lengthIds),
			]);

			if (!allColors.length || !allSizes.length) throw instance.httpErrors.conflict("Invalid colors or sizes");

			const colorMap = new Map(allColors.map((color) => [color.id, color]));
			const sizeMap = new Map(allSizes.map((size) => [size.id, size]));
			const lengthMap = new Map(allLengths.map((length) => [length.id, length]));
			const seenCombinations = new Set();

			return sizesAndColors.reduce((acc: any[], SC) => {
				const color = colorMap.get(SC.colorId);
				const size = sizeMap.get(SC.sizeId);
				const length = lengthMap.get(SC.lengthId);

				if (color && size) {
					// Skip if size.id is equal to color.id
					if (size.id === color.id) return acc;

					const combinationKey = `${size.id}-${color.id}-${length?.id || 0}`;

					if (!seenCombinations.has(combinationKey)) {
						seenCombinations.add(combinationKey);

						const sku: ISKUObject = {
							skuCustomAttributes: [
								{
									customAttributesId: size.id,
								},
								{
									customAttributesId: color.id,
								},
							],
							amount: SC.amount || 0,
							code: `${vendorCode}-${size.name.en.slice(0, 2).toUpperCase()}-${color.name.en
								.slice(0, 2)
								.toUpperCase()}-${serialNumber}-${length?.name.en.slice(0, 2).toUpperCase() || 0}`,
						};

						if (length) sku.skuCustomAttributes.push({ customAttributesId: length.id });

						if (productId) sku.productId = productId;
						acc.push(sku);
					}
				}
				return acc;
			}, []);
		},
		buildSupportedCustomAttributes: async (supportedCustomAttributes: number[], productId?: number) => {
			const customAttributes = CustomAttributesService(instance);
			const colors = await customAttributes.getMultipleColorsById(supportedCustomAttributes);
			return colors.map((color) => {
				return {
					customAttributeId: color.id,
					productId,
				};
			});
		},
		findCategory: async (id: number) => {
			const category = await Category.findOne({
				where: {
					id,
				},
			});
			if (!category) throw instance.httpErrors.notFound("common.response.notFound");
			return category;
		},
		getOneVendor: async (id: number) => {
			const vendor = await Admin.findOne({
				where: {
					id,
					role: AdminRole.vendor,
				},
			});
			if (!vendor) throw instance.httpErrors.notFound("common.response.notFound");
			return vendor;
		},
		deleteSKUS: async (data: { productId: number; transaction?: Transaction }) => {
			const { productId, transaction } = data;
			const skusId = (await SKU.findAll({ where: { productId } })).map((sku) => sku.id);
			await SKUCustomAttributes.destroy({
				where: {
					skuId: {
						[Op.in]: skusId,
					},
				},
				transaction,
			});
			const skus = await SKU.findAll({
				where: { productId },
				attributes: ["id"],
			});
			for (const sku of skus) {
				await sku.destroy({ transaction });
			}
		},
		uniqueSerial: async (vendorId: number, serial: string, productId?: number) => {
			const filters = new VendorFilterService();
			filters.equals("vendorId", vendorId);
			filters.equals("serial", serial);
			if (productId) filters.notEquals("id", productId);
			const existedSerial = await Product.findOne({
				where: filters.build(),
			});
			if (existedSerial) throw instance.httpErrors.conflict("product.serial.existed");
		},
	};

	const service = {
		getProductById: async (id: number) => {
			const product = await Product.findOne({
				where: {
					id,
				},
				include: [
					{ model: ProductSupportedAttributes, include: [CustomAttributes] },
					{
						model: SKU,
						required: false,
						include: [CustomAttributes],
					},
					{
						model: Admin,
						// include: [User]
					},
					Category,
				],
			});
			if (!product) throw instance.httpErrors.notFound("common.response.notFound");
			return product;
		},
		getOneProduct: async (id: number) => {
			const product = await Product.findOne({
				where: {
					id,
				},
			});
			if (!product) throw instance.httpErrors.notFound("common.response.notFound");
			return product;
		},
		findSkuById: async (data: { id: number; fullInfo?: boolean; transaction?: Transaction }) => {
			const { id, transaction, fullInfo } = data;
			const options: FindOptions<SKU> = { transaction };
			if (fullInfo)
				options.include = [{ model: Product, include: [Category, { association: "vendor" }] }, { association: "attributes" }];
			const sku = await SKU.findByPk(id, options);
			if (!sku) throw instance.httpErrors.notFound("product.response.skuNotFound");
			return sku;
		},

		getAllProductsVendorSide: async (dto: PaginatedRequest<IProductSearch>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;
			const [filters, skuFilter] = privateMethods.filterProducts({
				...dto.data!,
				vendorId: isAdmin ? (dto.data!.vendorId ? dto.data!.vendorId : undefined) : dto.request!.user.id,
			});

			let categoriesWhere = {};
			if (dto.data?.categoriesIds) {
				categoriesWhere = {
					id: { [Op.in]: dto.data.categoriesIds }, // Filter categories by given IDs
				};
			}
			const { count, rows: products } = await Product.findAndCountAll({
				where: filters,
				limit: dto.limit,
				offset: dto.offset,
				attributes: {
					exclude: ["images"],
				},
				include: [
					{ model: ProductSupportedAttributes, include: [CustomAttributes] },
					{
						model: SKU,
						required: Reflect.ownKeys(skuFilter).length ? true : false,
						where: skuFilter,
					},
					{
						model: Admin,
					},
					{
						model: Category,

						where: categoriesWhere,
					},
				],
				order: [["id", "desc"]],
			});
			return {
				count,
				products: products.map((p) =>
					ProductResponse(p, dto.langCode, true, (dto.request!.user.role as string) == AdminRole.admin)
				),
			};
		},

		getAllProducts: async (dto: PaginatedRequest<IProductSearch>) => {
			const isAdmin = dto.request?.user?.role === UserTypeEnum.ADMIN || dto.request?.user?.role === UserTypeEnum.VENDOR;
			if (!isAdmin && dto.data) dto.data.approved = true;
			const [filters, skuFilter] = privateMethods.filterProducts(dto.data!);
			const categoriesIds = dto.data?.categoriesIds;
			console.log(dto.data);

			let productSort: any = undefined;
			if (dto.data?.sortBy && dto.data.sortBy !== "rate") {
				productSort = orderCriteria({ sortBy: dto.data.sortBy, sort: dto.data.sort });
			}
			const adminFilter = new AdminFilterService();
			if (dto.data?.rate) {
				adminFilter.numberBetween("rate", dto.data.rate, dto.data.rate + 1, undefined, Op.lt);
			}
			if (!isAdmin) {
				adminFilter.equals("status", VendorStatus.Approved);
				adminFilter.equals("blocked", false);
			}
			if (dto.data?.sortBy === "rate") {
				productSort = [[Sequelize.literal(`"vendor"."rate"`), dto.data.sort || "DESC"]];
			}
			const includes: Includeable[] = [
				{ model: Admin, where: adminFilter.build(), as: "vendor" },
				{ model: ProductSupportedAttributes, include: [CustomAttributes], as: "supportedCustomAttributes", required: false },
				{
					model: SKU,
					required: false,
					include: [CustomAttributes],
				},
			];
			const whereOptions: WhereOptions<Product> | undefined = filters;

			if (categoriesIds && categoriesIds.length) {
				// Include for returning all categories
				const categoriesInclude: Includeable = {
					model: Category,
					through: { attributes: [] },
					where: {
						id: { [Op.in]: categoriesIds },
					},
					required: true,
				};

				includes.push(categoriesInclude);
			} else includes.push(Category);

			console.log(includes);

			console.log("whereOption", whereOptions);
			const { count, rows: products } = await Product.findAndCountAll({
				where: whereOptions,
				attributes: {
					exclude: ["images"],
				},
				include: includes,
				order: productSort,
				limit: dto.limit,
				offset: dto.offset,
			});

			return {
				count,
				products: products.map((product: any) =>
					ProductResponse(
						{
							...product.get({ plain: true }),
						},
						dto.langCode,
						isAdmin
					)
				),
			};
		},

		getProductbyId: async (dto: RequestData<number>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;

			const product = await privateMethods.getOneProduct(dto.data);
			return ProductDataResponse(product, dto.langCode, isAdmin);
		},

		getMetadata: async (dto: RequestData<undefined>) => {
			return {
				WashingInstructions: Object.values(WashingInstructions),
				IroningInstructions: Object.values(IroningInstructions),
				Fabric: Fabric,
				ProductType: Object.values(ProductType),
			};
		},

		getProductbyIdForAdmin: async (dto: RequestData<number>) => {
			const isAdmin = dto.request?.permission.isAdmin || false;

			const product = await privateMethods.getOneProduct(dto.data);
			return ProductDataResponse(product, dto.langCode, true, (dto.request!.user.role as string) == AdminRole.admin);
		},

		addNewProductFromVendor: async (transaction: Transaction, dto: RequestData<INewProduct>) => {
			const { description, images, mainImage, name, price, discountedPrice, etaDays, serial, readyToShip, vendorId, metadata } =
				dto.data;
			let { sizesAndColors, supportedCustomAttributes } = dto.data;
			if (readyToShip && sizesAndColors.length === 0) {
				throw instance.httpErrors.badRequest("size and colors must be not empty");
			}
			// const categoryName = (await privateMethods.findCategory(category)).name
			//   .en;
			const vendor = await privateMethods.getOneVendor(vendorId ? vendorId : dto.request!.user.id);
			// const latestSerial = await privateMethods.getLastestSerial(vendor.id)
			await privateMethods.uniqueSerial(vendor.id, serial);
			if (!readyToShip) sizesAndColors = [];
			else supportedCustomAttributes = [];

			let skus: any[] = [];
			let supportedAttributes: any[] = [];
			if (readyToShip)
				skus = await privateMethods.buildSKU(
					vendor.vendorName.en,
					// categoryName,
					sizesAndColors,
					serial
				);
			else {
				supportedAttributes = await privateMethods.buildSupportedCustomAttributes(supportedCustomAttributes);
			}

			const product = await Product.create(
				{
					description,
					images,
					mainImage,
					name,
					price,
					discountedPrice,
					supportedCustomAttributes: supportedAttributes,
					readyToShip,
					vendorId: vendor.id,
					etaDays,
					skus,
					serial,
					metadata,
					// categoryId: category,
					// latestSerial: latestSerial + 1
				},
				{
					transaction,
					include: [
						ProductSupportedAttributes,
						{
							model: SKU,
							include: [SKUCustomAttributes],
						},
					],
				}
			);

			if (dto.data.categoriesIds) {
				const categoriesService = CategoryService(instance);
				await categoriesService.checkCategoriesExisting({
					ids: dto.data.categoriesIds,
				});
				await product.$set("categories", dto.data.categoriesIds, {
					transaction,
				});
			}

			return {
				message: translateMessage("common.response.success", dto.langCode),
			};
		},

		editProductFromVendor: async (transaction: Transaction, dto: RequestData<IEditProduct>) => {
			let {
				// category,
				description,
				images,
				mainImage,
				name,
				price,
				sizesAndColors,
				categoriesIds,
				readyToShip,
				discountedPrice,
				etaDays,
				productId,
				supportedCustomAttributes,
				serial,
				vendorId,
				metadata,
			} = dto.data;

			if (sizesAndColors.length === 0 && readyToShip) {
				throw instance.httpErrors.badRequest("size and colors must be not empty");
			}

			const product = await privateMethods.getOneProduct(productId);
			// const categoryName = (await privateMethods.findCategory(category)).name
			//   .en;
			const vendorName = (await privateMethods.getOneVendor(vendorId ? vendorId : dto.request!.user.id)).vendorName.en!;
			await privateMethods.uniqueSerial(product.vendorId, serial, product.id);

			await privateMethods.deleteSKUS({ productId, transaction });
			await ProductSupportedAttributes.destroy({ where: { productId: product.id }, transaction });
			await product.update(
				{
					// categoryId: category,
					description,
					images,
					discountedPrice,
					readyToShip,
					mainImage,
					etaDays,
					name,
					price,
					metadata,
				},
				{ transaction }
			);

			if (categoriesIds) {
				const categoriesService = CategoryService(instance);
				await categoriesService.checkCategoriesExisting({
					ids: categoriesIds,
				});
				await product.$set("categories", categoriesIds, {
					transaction,
				});
			}

			if (!readyToShip) {
				sizesAndColors = [];
			}
			let skus: any[] = [];
			let supportedAttributes: any[] = [];

			if (readyToShip)
				skus = await privateMethods.buildSKU(
					vendorName,
					// categoryName,
					sizesAndColors,
					product.serial,
					product.id
				);
			else {
				supportedAttributes = await privateMethods.buildSupportedCustomAttributes(supportedCustomAttributes);
			}
			if (skus.length)
				await SKU.bulkCreate(skus, {
					include: [
						{
							model: SKUCustomAttributes,
							as: "skuCustomAttributes",
						},
					],
					transaction,
				});

			if (supportedAttributes.length) {
				await ProductSupportedAttributes.bulkCreate(
					supportedAttributes.map((att) => {
						return { ...att, productId };
					})
				);
			}
			return ProductDataResponse(
				await product.reload({ transaction }),
				dto.langCode,
				true,
				(dto.request!.user.role as string) == AdminRole.admin
			);
		},
		seedData: async (transaction: Transaction, dto: RequestData<any>) => {
			const customAttribute = CustomAttributesService(instance);
			const lengths = await customAttribute.getAllLengths();
			const length = lengths[0];
			if (!length) return false;
			const skus = await SKU.findAll({});
			for (const sku of skus) {
				await SKUCustomAttributes.create({ skuId: sku.id, customAttributesId: length.id }, { transaction });
				await sku.update(
					{
						code: sku.code + length.name.en.slice(0, 2).toUpperCase(),
					},
					{ transaction }
				);
			}

			return "success";
		},

		deleteProduct: async (dto: RequestData<number>) => {
			const product = await privateMethods.getOneProduct(dto.data);
			await privateMethods.deleteSKUS({ productId: product.id });
			await product.destroy();
			return {
				message: translateMessage("common.response.success", dto.langCode),
			};
		},

		approveProduct: async (dto: RequestData<number>) => {
			const product = await privateMethods.getOneProduct(dto.data);
			await product.update({ approved: true });
			return ProductDataResponse(await product.reload(), dto.langCode, true, true);
		},

		disapproveProduct: async (dto: RequestData<number>) => {
			const product = await privateMethods.getOneProduct(dto.data);
			await product.update({ approved: false });
			return ProductDataResponse(await product.reload(), dto.langCode, true, true);
		},
	};
	return service;
};
export default ProductService;
