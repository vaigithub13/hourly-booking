import { SortDirectionEnum } from "src/utils/json-schema";
import { IPaginationQuery, LangObject } from "../../types/common-types";
import { VendorStatus } from "../admin/admin.dto";
import { Admin } from "../admin/admin.model";

export interface VendorSignup {
  vendorName: LangObject;
  logo: string;
  email: string;
  phoneNumber: string;
  address: object;
  certificate: string;
  ownerName: LangObject;
  username: string;
  password: string;
  appPercentage: number;
}
export interface IEditProfileDto {
  id: number;
  vendorName?: LangObject;
  logo?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    unit: string;
    street: string;
    building: string;
    zone: string;
    longitude: number;
    latitude: number;
  };
  certificate?: string;
  ownerName?: LangObject;
  username?: string;
}

export interface IGetVendorQueryDto extends IPaginationQuery {
  blocked?: boolean;
  search?: string;
  status?: string;
  approved?: boolean;
  sort?: SortDirectionEnum;
  sortBy?: VendorSortOptions;
  rate?: number;
}

export enum VendorSortOptions {
  id = "id",
}

export interface IGetVendorByToken {
  token: string;
}
export interface IVendorResponse {
  id: number;
  vendorName: LangObject;
  logo: string;
  email: string;
  phoneNumber: string;
  rate: number;
  designerWallet: number;
  address: {
    unit: string;
    street: string;
    building: string;
    zone: string;
    longitude: number;
    latitude: number;
  };
  certificate: string;
  appPercentage: number;
  ownerName: LangObject;
  username: string;
  status: VendorStatus;
  blocked: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export const vendorResponse = (
  vendor: Admin,
  langCode: string,
  multiLang: boolean
): IVendorResponse => {
  const {
    id,
    email,
    rate,
    vendorName,
    appPercentage,
    phoneNumber,
    designerWallet,
    certificate,
    address,
    blocked,
    status,
    logo,
    ownerName,
    username,
  } = vendor.get();
  return {
    id,
    logo,
    ownerName: multiLang ? ownerName : ownerName[langCode],
    username,
    address,
    certificate,
    designerWallet,
    rate,
    email,
    appPercentage,
    vendorName: multiLang ? vendorName : vendorName[langCode],
    phoneNumber,
    status,
    blocked,
  };
};
