import { SortDirectionEnum } from "./../../utils/json-schema/index";
import { AttributeEnum } from "src/types/enums";
import { LangObject } from "../../types/common-types";
import { adminVendorResponse, adminVendorResponseLangs, VendorResponse, VendorResponseLangs } from "../admin/admin.dto";
import { CustomAttributesResponse, customAttributesResponse } from "../custom_attributes/custom_attributes.dto";
import { Product, SKU } from "./product.model";
import { NumberReference } from "aws-sdk/clients/connect";
import { product } from "ramda";
export enum WashingInstructions {
	HandWash = "Hand Wash",
	DryClean = "Dry Clean",
}

export enum IroningInstructions {
	Light = "Light",
	Medium = "Medium",
	Steam = "Steam",
}

export const Fabric = [
  {
    name: { ar: "الأقمشة الكلاسيكية والمستخدمة يوميًا", en: "Classic and everyday fabrics" },
    values: [
      { ar: "كريب سعودي", en: "Saudi Crepe" },
      { ar: "كريب ياباني", en: "Japanese Crepe" },
      { ar: "كريب كوري", en: "Korean Crepe" },
      { ar: "كريب إندونيسي", en: "Indonesian Crepe" },
      { ar: "كريب فرنسي", en: "French Crepe" },
      { ar: "كريب شيفون", en: "Chiffon Crepe" },
      { ar: "لينن", en: "Linen" },
      { ar: "جورجيت", en: "Georgette" },
      { ar: "كريب جورجيت", en: "Crepe Georgette" },
      { ar: "بوبلين", en: "Poplin" },
      { ar: "فيسكوز", en: "Viscose" },
      { ar: "بوليستر", en: "Polyester" },
      { ar: "قماش مطفي", en: "Matte Fabric" }
    ]
  },
  {
    name: { ar: "الأقمشة الفاخرة والمناسبات", en: "Luxury and occasion fabrics" },
    values: [
      { ar: "حرير طبيعي", en: "Natural Silk" },
      { ar: "حرير ساتان", en: "Silk Satin" },
      { ar: "حرير دبل فيس", en: "Double-Face Silk" },
      { ar: "جاكارد", en: "Jacquard" },
      { ar: "دانتيلا", en: "Lace" },
      { ar: "أورغانزا", en: "Organza" },
      { ar: "تفتا", en: "Taffeta" },
      { ar: "مخمل", en: "Velvet" },
      { ar: "شانتون", en: "Shantung" },
      { ar: "شانتون حرير", en: "Silk Shantung" }
    ]
  },
  {
    name: { ar: "الأقمشة الشتوية أو الثقيلة", en: "Winter or heavy fabrics" },
    values: [
      { ar: "صوف خفيف", en: "Light Wool Crepe" },
      { ar: "صوف ثقيل", en: "Heavy Wool Fabric" },
      { ar: "تريكو", en: "Knitted Fabric" }
    ]
  },
  {
    name: { ar: "الأقمشة العصرية والإضافات", en: "Trendy fabrics and accessories" },
    values: [
      { ar: "مشبك / شبك", en: "Mesh / Net" },
      { ar: "تول", en: "Tulle" },
      { ar: "شامواه", en: "Suede" },
      { ar: "ليكرا", en: "Lycra" },
      { ar: "قطن مخلوط", en: "Cotton Blend" }
    ]
  }
];


export enum ProductType {
	Open = "Open",
	Closed = "Closed",
	Kaftan = "Kaftan",
}
export enum ProductSortOptions {
	price = "price",
	createdAt = "createdAt",
	rate = "rate",
}
export interface ISearch {
	name?: string;
	color?: string;
	size?: string;
	// categoryId?: number;
	sort?: SortDirectionEnum;
	sortBy?: ProductSortOptions;
	categoriesIds?: number[];
	sku?: string;
	serial?: string;
	isDiscounted: boolean;
	minPrice?: number;
	maxPrice?: number;
}

export interface IProductSearch extends ISearch {
	vendorId?: number;
	approved?: boolean;
	readyToShip?: boolean;
	rate?: number;
}

export interface IProductResponse {
	id: number;
	name: LangObject | string;
	isRequiredLength: boolean;
	description: LangObject | string;
	price: number;
	discountedPrice?: number;
	mainImage: string;
	readyToShip: boolean;
	etaDays: number;
	images: string[];
	approved: boolean;
	serial: string;
	metadata?: object;
	categories?: { id: number; name: LangObject | string }[];
	// category: {
	//   id: number;
	//   name: LangObject | string;
	// } | null;
	vendor?: VendorResponse | VendorResponseLangs;
	supportedCustomAttributes: any;
}

export interface ISKUResponse {
	id: number;
	size: customAttributesResponse | null;
	color: customAttributesResponse | null;
	length: customAttributesResponse | null;
	amount: number;
	code: string;
	product?: IProductResponse;
}

export interface IProductDataResponse {
	id: number;
	name: LangObject | string;
	isRequiredLength: boolean;
	description: LangObject | string;
	price: number;
	discountedPrice?: number;
	mainImage: string;
	etaDays: number;
	approved: boolean;
	readyToShip: boolean;
	images: string[];
	serial: string;
	totalOrders: number;
	metadata?: object;
	categories?: { id: number; name: LangObject | string }[];
	// category: {
	//   id: number;
	//   name: LangObject | string;
	// } | null;
	skus?: ISKUResponse[];
	vendor?: VendorResponse | VendorResponseLangs;
	supportedCustomAttributes: any;
}

export interface ISizeColor {
	colorId: number;
	sizeId: number;
	lengthId: number;
	amount?: number;
	// serial: number
}

export interface INewProduct {
	name: LangObject;
	description: LangObject;
	price: number;
	discountedPrice?: string;
	mainImage: string;
	images: string[];
	categoriesIds: number[];
	readyToShip: boolean;
	metadata?: object;
	// category: number;
	etaDays: number;
	serial: string;
	vendorId?: number;
	sizesAndColors: ISizeColor[];
	supportedCustomAttributes: number[];
}

export interface ISKUObject {
	skuCustomAttributes: { customAttributesId: number }[];
	amount: number;
	code: string;
	productId?: number;
}

export interface IEditProduct {
	name: LangObject;
	description: LangObject;
	price: number;
	discountedPrice?: number;
	etaDays: number;
	mainImage: string;
	serial: string;
	images: string[];
	readyToShip: boolean;
	vendorId?: number;
	categoriesIds: number[];
	metadata?: object;
	// category: number;
	productId: number;
	sizesAndColors: ISizeColor[];
	supportedCustomAttributes: number[];
}

export const ProductResponse = (
	data: Product,
	langCode: string,
	multiLang: boolean = false,
	includeVendor: boolean = true
): IProductResponse => {
	let isRequiredLength = false;
	data.categories?.forEach((category) => {
		isRequiredLength ||= category.isRequiredLength;
	});
	return {
		id: data.id,
		name: multiLang ? data.name : data.name[langCode],
		isRequiredLength,
		description: multiLang ? data.description : data.description[langCode],
		price: data.price,
		serial: data.serial,
		approved: data.approved,
		etaDays: data.etaDays,
		readyToShip: data.readyToShip,
		discountedPrice: data.discountedPrice,
		mainImage: data.mainImage,
		metadata: data.metadata,
		images: data.images || [],
		categories: data.categories
			? data.categories.map((category) => ({
					id: category.id,
					name: multiLang ? category.name : category.name[langCode],
					image: category.image,
					isRequiredLength: category.isRequiredLength,
			  }))
			: undefined,
		supportedCustomAttributes: data.supportedCustomAttributes
			? data.supportedCustomAttributes.map((s) => CustomAttributesResponse(s.customAttribute, langCode, multiLang))
			: undefined,
		// category: data.category
		//   ? {
		//       id: data.category.id,
		//       name: multiLang ? data.category.name : data.category.name[langCode],
		//     }
		//   : null,
		vendor:
			includeVendor && data.vendor
				? multiLang
					? adminVendorResponseLangs(data.vendor)
					: adminVendorResponse(data.vendor, langCode)
				: undefined,
	};
};

export const SKUResponse = (sku: SKU, langCode: string, multiLang: boolean = false): ISKUResponse => {
	const size = sku.attributes?.find((att) => att.type == AttributeEnum.size);
	const color = sku.attributes?.find((att) => att.type == AttributeEnum.color);
	const length = sku.attributes?.find((att) => att.type == AttributeEnum.length) || null;
	return {
		id: sku.id,
		amount: sku.amount,
		code: sku.code,
		size: size ? CustomAttributesResponse(size, langCode, multiLang) : null,
		color: color ? CustomAttributesResponse(color, langCode, multiLang) : null,
		length: length ? CustomAttributesResponse(length, langCode, multiLang) : null,
		product: sku.product ? ProductResponse(sku.product, langCode) : undefined,
	};
};

export const ProductDataResponse = (
	data: Product,
	langCode: string,
	multiLang: boolean = false,
	includeVendor: boolean = true
): IProductDataResponse => {
	let isRequiredLength = false;
	data.categories?.forEach((category) => {
		isRequiredLength ||= category.isRequiredLength;
	});
	return {
		id: data.id,
		isRequiredLength,
		name: multiLang ? data.name : data.name[langCode],
		description: multiLang ? data.description : data.description[langCode],
		price: data.price,
		discountedPrice: data.discountedPrice,
		approved: data.approved,
		mainImage: data.mainImage,
		totalOrders: data.totalOrders,
		readyToShip: data.readyToShip,
		metadata: data.metadata,
		images: data.images || [],
		etaDays: data.etaDays,
		categories: data.categories
			? data.categories.map((category) => ({
					id: category.id,
					name: multiLang ? category.name : category.name[langCode],
					isRequiredLength: category.isRequiredLength,
			  }))
			: undefined,
		// category: data.category
		//   ? {
		//       id: data.category.id,
		//       name: multiLang ? data.category.name : data.category.name[langCode],
		//     }
		//   : null,
		serial: data.serial,
		skus: data.skus ? data.skus.map((s) => SKUResponse(s, langCode, multiLang)) : undefined,
		supportedCustomAttributes: data.supportedCustomAttributes
			? data.supportedCustomAttributes.map((s) => CustomAttributesResponse(s.customAttribute, langCode, multiLang))
			: undefined,
		vendor: includeVendor
			? multiLang
				? adminVendorResponseLangs(data.vendor)
				: adminVendorResponse(data.vendor, langCode)
			: undefined,
	};
};
