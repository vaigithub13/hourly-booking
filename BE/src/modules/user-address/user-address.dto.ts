import { UserAddress } from "../user-address/user-address.model";

export interface ICreateUserAddress {
  title: string;
  zone: string;
  street: string;
  description?: string;
  buildingInfo: string;
  isDefault: boolean;
  unit?: string;
  lat: string;
  lng: string;
  userId: number;
}

export interface IUpdateUserAddress {
  id: number;
  title?: string;
  zone?: string;
  street?: string;
  isDefault?: boolean;
  description?: string;
  buildingInfo?: string;
  unit?: string;
  lat?: string;
  lng?: string;
}

export interface IUserAddressResponse {
  id: number;
  title: string;
  zone: string;
  street: string;
  insideDoha: boolean;
  isDefault: boolean;
  description?: string;
  buildingInfo: string;
  unit?: string;
  lat: string;
  lng: string;
  userId: number;
}

export interface IGetUserAddressesQuery {
  userId?: number;
}

export const userAddressResponse = (
  userAddress: UserAddress
): IUserAddressResponse => {
  const {
    id,
    title,
    zone,
    street,
    description,
    buildingInfo,
    unit,
    isDefault,
    lat,
    insideDoha,
    lng,
    userId,
  } = userAddress;

  return {
    id,
    title,
    zone,
    street,
    insideDoha,
    isDefault,
    description,
    buildingInfo,
    unit,
    lat,
    lng,
    userId,
  };
};
