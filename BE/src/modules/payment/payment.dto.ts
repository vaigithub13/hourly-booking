import { JObject } from "src/types/common-types";
import { User } from "../user/user.model";

// SkipCash DTOs
export interface ISCCreatePaymentPayload {
  Uid: string; // A random string, usually generating a new UUID is fine. Helps to randomize calculated signature.
  KeyId: string; //  the ID of the generated private key
  Amount: string; //the transaction amount. It is a string. The number must be separated by a dot and hasa max of 2 decimal places
  FirstName: string;
  LastName: string;
  Phone: string;
  Email: string;
  Street?: string;
  City?: string;
  State?: string;
  Country?: string;
  PostalCode?: string;
  TransactionId: string;
  Custom1?: string; // the Merchant custom value, can be used in any way by the merchant
  Custom2?: string; // the Merchant custom value, can be used in any way by the merchant
}

interface ISCPaymentResultObj {
  id: string;
  statusId: number;
  created: string;
  payUrl: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  custom1: string | null;
  custom2: string | null;
  visaId: string | null;
  status: string;
}

export interface ISCPaymentResponse {
  resultObj: ISCPaymentResultObj;
  returnCode: number;
  errorCode: number;
  errorMessage: any;
  error: any;
  validationErrors: any;
  hasError: boolean;
  hasValidationError: boolean;
}

export interface ISCWebhookSentPayload {
  PaymentId: string;
  StatusId: number;
  Amount: string;
  TransactionId: string;
  Custom1: string;
  Custom2: string;
  VisaId?: string;
  TokenId?: string;
  CardType: string;
}

export interface IReturnURLQuery {
  id: string;
  statusId: string;
  status: string;
  transId: string;
  custom1: string;
}
//----------------------------------------

export interface ICreatePaymentDto {
  user: User;
  transactionId: string;
  amount: number;
  toPayWithWallet?: number;
  locationId: number;
}

export interface IPaymentResponse {
  id: number;
  amount: string;
  uid: string;
  transactionId: string;
  custom1: string;
  statusId: string;
  paymentUrl: string;
  paymentId: string;
  skipCashResponse: ISCPaymentResultObj;
  cardType: string;
}
