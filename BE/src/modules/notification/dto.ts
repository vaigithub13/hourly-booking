import { LangObject } from "src/types/common-types";
import { IUserResponse, userResponse } from "../user/user.dto";
import { Notifications } from "./notification.model";
export enum INotificationType {
  // PaymentsWalletUpdate = "PaymentsWalletUpdate",
  // PaymentTransactionsApproved = "PaymentTransactionsApproved",
  // PaymentTransactionsRejected = "PaymentTransactionsRejected",
  VendorApproval = "VendorApproval",
  VendorRejection = "VendorRejection",
  DeleteUserAccount = "DeleteUserAccount",
  DeleteUserAccountByAdmin = "DeleteUserAccountByAdmin",
  VendorOrder = "VendorOrder",
  CustomerOrder = "CustomerOrder",
  OrderStatus = "OrderStatus",
  WalletRefundStatus = "WalletRefundStatus",
  ReturnOrderStatus = "ReturnOrderStatus",
  VendorReplied = "VendorReplied",
  CoboneNotification = "CoboneNotification",
  AdsApproval = "AdsApproval",
  AdsRejection = "AdsRejection",
  QueryResolved = "QueryResolved",
  HideOrUnhide = "HideOrUnhide",
  GeneralNotification = "GeneralNotification",
}

export const NotificationMapTemplate = {
  0: "(!)",
  1: "(!!)",
  2: "(!!!)",
  3: "(!!!!)",
  4: "(!!!!!)",
};

export const notificationTemplate = (type: string) => {
  const Object = {
    VendorApproval: {
      contents: {
        en: "Your request to be a vendor has been Approved",
        ar: "لقد تمت الموافقة على طلبك لتصبح بائعًا",
      },
      headings: {
        en: "Vendor Status",
        ar: "حالة البائع",
      },
    },
    VendorRejection: {
      contents: {
        en: "Your request to be a vendor has been Rejected",
        ar: "لقد تم رفض طلبك بأن تصبح بائعًا",
      },
      headings: {
        en: "Vendor Status",
        ar: "حالة البائع",
      },
    },
    DeleteUserAccount: {
      contents: {
        en: "You Deleted Your (!) Account",
        ar: "(!) لقد حذفت الحساب ",
      },
      headings: {
        en: "Delete User",
        ar: "حذف المستخدم",
      },
    },
    DeleteUserAccountByAdmin: {
      contents: {
        en: "Your account has been deleted",
        ar: "تم حذف حسابك",
      },
      headings: {
        en: "Delete User",
        ar: "حذف المستخدم",
      },
    },
    VendorOrder: {
      contents: {
        en: "You Have New Order (!). Check it!",
        ar: "!لديك طلب جديد (!) . تحقق منه",
      },
      headings: {
        en: "Vendor Order",
        ar: "طلب البائع",
      },
    },
    CustomerOrder: {
      contents: {
        en: "Your Order (!) has been placed",
        ar: "(!) تم وضع طلبك ",
      },
      headings: {
        en: "Customer Order",
        ar: "طلب الزبون",
      },
    },
    OrderStatus: {
      contents: {
        en: "Your Order (!) is (!!)",
        ar: "(!!) (!) إن الطلب",
      },
      headings: {
        en: "Order Status",
        ar: "حالة الطلب",
      },
    },
    VendorReplied: {
      contents: {
        en: "The Designer Replied To Your Order (!)",
        ar: "المصمم رد على طلبك (!)"
      },
      headings: {
        en: "Designer Reply",
        ar: "رد المصمم",
      }
    },
    ReturnOrderStatus: {
      contents: {
        en: "Your Return Order (!) is (!!)",
        ar: "(!!) (!) إن طلب الإرجاع",
      },
      headings: {
        en: "Order Status",
        ar: "حالة الطلب",
      },
    },
    CoboneNotification: {
      contents: {
        en: "Your delivery is on us! Use (!) for free delivery on your next order,valid until (!!),Shop now and save with Gash",
        ar: "التوصيل مجانا علينا،استخدم (!) من اجل التوصيل مجانا لطلبك التالي،صالح حتى(!!)،تسوق الان وقم بالتوفير مع غاش",
      },
      headings: {
        en: "Coupon Notification",
        ar: "إشعار القسيمة",
      },
    },
    AdsApproval: {
      contents: {
        en: "Your Ad With Title (!) Has Been Approved",
        ar: "(!!) تمت الموافقة على إعلانك (!) الذي يحمل العنوان ",
      },
      headings: {
        en: "Ads Approval",
        ar: "الموافقة على الإعلانات",
      },
    },
    AdsRejection: {
      contents: {
        en: "Your Ad With Title (!) Has Been Rejected",
        ar: "(!!) تم رفض إعلانك (!) الذي يحمل العنوان ",
      },
      headings: {
        en: "Ads Rejection",
        ar: "رفض الإعلانات",
      },
    },
    HideOrUnhide: {
      contents: {
        en: "Your Account Has Been Set As (!) From The Admin",
        ar: "لقد تم تعيين حسابك كـ (!) من قبل المسؤول",
      },
      headings: {
        en: "Account Status",
        ar: "حالة الحساب",
      },
    },
  };

  return Object[type];
};

export interface NotificationResponse {
  id: number;
  type?: string;
  userId?: number;
  user?: IUserResponse;
  isPublic?: boolean;
  seen?: boolean;
  content?: LangObject;
  title?: LangObject;
  data?: object;
  dateTime: string;
  isSent: boolean;
}
export interface notificationDto {
  contents: LangObject;
  headings: LangObject;
  data?: object;
  devicesIds?: Array<string>;
}
export interface notificationServiceDto {
  type: string;
  userIds?: Array<number>;
  params?: Array<LangObject>;
  data?: object;
  isPublic?: boolean;
  content?: object;
  deviceId?: string;
  title?: object;
  seen?: boolean;
}

export const notificationResponse = (
  data: Notifications,
  langCode: string,
  multiLang: boolean
): NotificationResponse => {
  const {
    id,
    type,
    userId,
    user,
    isPublic,
    seen,
    content,
    title,
    isSent,
    data: d,
    createdAt,
  } = data;
  return {
    id: id,
    type: type ?? undefined,
    userId: userId,
    user: user ? userResponse(user, langCode) : undefined,
    isPublic: isPublic ?? undefined,
    seen: seen ?? undefined,
    content: content ?? undefined,
    title: title ?? undefined,
    data: d ?? undefined,
    dateTime: createdAt,
    isSent,
  };
};
