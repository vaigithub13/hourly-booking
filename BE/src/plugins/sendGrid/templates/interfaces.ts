export interface IEmailOrderDetails {
  orderId: number;
  items: unknown[]; // TODO: change the items interface
  totalPrice?: number;
}

export interface ISgMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface ISendOrderItem {
  price: number;
  image: string;
  text: string;
  quantity: number;
}

export enum EmailTitleEnum {
  ORDER_CONFIRMATION = "Order Confirmation",
  PAYMENT_INVOICE = "Payment Invoice",
  DELIVERY_CONFIRMATION = "Delivery Confirmation",
  CUSTOMER_CANCEL_ORDER = "Customer canceled an order",
  CUSTOMER_RETURN_ORDER = "Customer returned an order",
}

export interface ISendOrderDetails {
  emailTitle: EmailTitleEnum;
  emailDescription: string;
  subtotal: number;
  paymentMethod: string;
  shippingCost: number;
  orderId: string;
  userName: string;
  items: ISendOrderItem[];
  total?: number;
}

export interface IDynamicTemplateConfirmOrderEmailData {
  to: string;
  from: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: ISendOrderDetails;
  cc?: string;
}

export interface ISendVendorOrderNotificationEmail {
  orderId: number;
  to: string;
  from: string;
  subject: string;
  userName: string;
  action: "cancelled" | "returned";
}
