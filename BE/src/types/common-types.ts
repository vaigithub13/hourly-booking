import { StringEnum } from "./../utils/json-schema";
import { Static, Type } from "@sinclair/typebox";

// responses
export const responseMessage = Type.Object({
  message: Type.String(),
});
export type responseMessageType = Static<typeof responseMessage>;

// params
export const idParamObject = Type.Object({
  id: Type.Number(),
});

export const LangObjectType = Type.Object({
  en: Type.String(),
  ar: Type.String(),
});

export const qatariPhoneNumberType = Type.String({ pattern: "^\\+974\\d{8}$" });

export enum OtpTarget {
  WhatsApp = "WhatsApp",
  Sms = "SMS",
}
export enum OtpSendOn {
  Email = "Email",
  Phone = "Phone",
}

export type sortDirectionType = "ASC" | "DESC";
export const sortByOptions = StringEnum(["id"]);
export const sortDirection = StringEnum(["ASC", "DESC"]);
export const otpTarget = StringEnum(Object.values(OtpTarget));
export const otpSendOn = StringEnum(Object.values(OtpSendOn));

export enum UserTypeEnum {
  ADMIN = "admin",
  VENDOR = "vendor",
  USER = "user",
}

export interface LangObject {
  en: string;
  ar: string;
}
export interface JObject {
  [key: string]: any;
}

export interface IPaginationQuery {
  limit: number;
  offset: number;
}
