import { JObject } from "./../types/common-types";
import { promisify } from "util";
import crypto from "crypto";
import { Order } from "sequelize";
import messages from "../plugins/i18n/messages";

export const locationToPoint = (location: { lng: number; lat: number }) => {
  const point = {
    type: "Point",
    coordinates: [location.lng, location.lat], // GeoJson format: [lng, lat]
    crs: { type: "name", properties: { name: "EPSG:4326" } },
  };
  return point;
};
export const pointToLocation = (point: JObject) => {
  return {
    lng: point.coordinates[0],
    lat: point.coordinates[1],
  };
};

export const getAmountPercentage = (amount: number, percentage: number) => {
  return +((amount * percentage) / 100).toFixed(2);
};

export const orderCriteria = (query: {
  sortBy?: string;
  sort?: "ASC" | "DESC";
  langCode?: string;
}) => {
  const { langCode, sort, sortBy } = query;
  if (langCode) {
    return [
      [`${`${sortBy}.${langCode}` || "id"}`, `${sort || "DESC"}`],
    ] as Order;
  } else {
    return [[`${sortBy || "id"}`, `${sort || "DESC"}`]] as Order;
  }
};

export const hashPassword = async (pass: string) => {
  const scrypt = promisify(crypto.scrypt);
  const salt = crypto.randomBytes(8).toString("hex");
  const derivedKey = (await scrypt(pass, salt, 64)) as Buffer;

  const password = `${salt}:${derivedKey.toString("hex")}`;
  return password;
};

export const translateMessage = (key: string, lang: string) => {
  if (!messages[key]) {
    return key;
  }
  return messages[key][lang];
};

export const getMessageLanguagesObject = (key: string) => {
  return messages[key];
};
