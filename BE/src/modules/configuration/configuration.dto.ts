import { LangObject } from "src/types/common-types";
import { Configuration } from "./configuration.model";

export interface EditGlobalConfigsDto {
  payment?: boolean;
  supportEmail: string;
  eventsReceivingEmail: string;
  homePageText?: LangObject;
  privacyAndPolicy?: LangObject;
  termsAndConditions?: LangObject;
  whatsappNumber?: string;
  deliveryPricing?: { insideDoha: number; outsideDoha: number };
  ordersReturnReasons?: LangObject[];
  ordersCancelReasons?: LangObject[];
  // walletRefundTimeInMinutes?: number;
}

export const globalConfigsResponse = (data: {
  configs: Configuration;
  langCode?: string;
  multiLang?: boolean;
}) => {
  const { configs, langCode } = data;
  const {
    payment,
    homePageText,
    privacyAndPolicy,
    termsAndConditions,
    deliveryPricing,
    whatsappNumber,
    supportEmail,
    eventsReceivingEmail,
    ordersReturnReasons,
    ordersCancelReasons,
    appleAppSiteAssociation,
    assetLinks,
    // walletRefundTimeInMinutes
  } = configs;
  return {
    payment,
    homePageText: langCode ? homePageText[langCode] : homePageText,
    privacyAndPolicy: langCode ? privacyAndPolicy[langCode] : privacyAndPolicy,
    termsAndConditions: langCode
      ? termsAndConditions[langCode]
      : termsAndConditions,
    deliveryPricing,
    whatsappNumber,
    supportEmail,
    eventsReceivingEmail,
    ordersReturnReasons: langCode
      ? ordersReturnReasons.map((reason) => reason[langCode])
      : ordersReturnReasons,
    ordersCancelReasons: langCode
      ? ordersCancelReasons.map((reason) => reason[langCode])
      : ordersCancelReasons,

    assetLinks,
    appleAppSiteAssociation,
    // walletRefundTimeInMinutes,
  };
};
