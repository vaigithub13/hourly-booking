import { LangObject } from "../../types/common-types";
import { Location } from "./locations.model";

export interface CreateLocation {
  zone: string;
  // area: LangObject;
  price: number;
  lat: string;
  lng: string;
}
export interface UpdateLocation {
  id: number;
  zone?: string;
  // area?: LangObject;
  price?: number;
  lat?: string;
  lng?: string;
}
export interface LocationResponse {
  id: number;
  zone: string;
  lat: string;
  lng: string;
  price: number;
}

export interface ISearch {
  name?: string;
}

export const locationResponse = (
  location: Location,
  langCode: string,
  isAdmin: boolean = false
) => {
  const { id, zone, price, lat, lng } = location;
  const response: LocationResponse = {
    id,
    zone: zone,
    price: price,
    lat: lat,
    lng: lng,
    // area: isAdmin ? area : area[langCode],
  };
  return response;
};
