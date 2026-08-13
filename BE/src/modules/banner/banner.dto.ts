import {
  IProductDataResponse,
  ProductDataResponse,
  ProductResponse,
} from "./../product/product.dto";
import { LangObject } from "../../types/common-types";
import {
  adminVendorResponse,
  adminVendorResponseLangs,
  VendorResponse,
  VendorResponseLangs,
} from "../admin/admin.dto";
import { Banner } from "./banner.model";
import { CategoryResponse, ICategoryResponse } from "../category/category.dto";

export enum bannerType {
  offer = "offer",
  NORMAL = "Normal",
}

export enum BannerType {
  Admin = "Admin",
  Marketing = "Marketing",
}

export interface IGetBanners {
  type?: BannerType;
  isAdmin: boolean;
}
export interface editBannerDto {
  id: number;
  image?: string;
  title?: LangObject;
  vendorId?: number;
  productId?: number;
  categoryId?: number;
}

export interface sortBannerDto {
  banner: number[];
}

export interface createBannerDto {
  image: string;
  from: Date;
  to: Date;
  title: LangObject;
  vendorId?: number;
  productId?: number;
  categoryId?: number;
}

export interface BannerResponse {
  id: number;
  image: string;
  title: string | LangObject;
  type: BannerType;
  url: string;
  vendor?: VendorResponse | VendorResponseLangs | null;
  product: IProductDataResponse | null;
  category: ICategoryResponse | null;
  from?: Date;
  to?: Date;
}

export const bannerResponse = (
  data: Banner,
  langCode: string,
  multiLang: boolean
): BannerResponse => {
  return {
    id: data.id,
    title: multiLang ? data.title : data.title[langCode],
    image: data.image,
    type: data.type,
    from: data.from,
    to: data.to,
    vendor: data.vendor
      ? multiLang
        ? adminVendorResponseLangs(data.vendor)
        : adminVendorResponse(data.vendor, langCode)
      : null,
    product: data.product
      ? multiLang
        ? ProductDataResponse(data.product, langCode, true)
        : ProductDataResponse(data.product, langCode)
      : null,
    category: data.category
      ? multiLang
        ? CategoryResponse(data.category, langCode, true)
        : CategoryResponse(data.category, langCode, false)
      : null,
    url: data.url,
  };
};
