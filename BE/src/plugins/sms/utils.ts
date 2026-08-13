export enum MessageEncodingEnum {
  DEFAULT = "0",
  ASCI = "1",
  OCTET = "2",
  LATIN = "3",
  OCTET_UNSPECIFIED = "4",
}

export enum MessageTypeEnum {
  PROMOTIONAL = "1",
  TRANSACTIONAL = "2",
  OTP = "3",
}

export interface ISendSMSPayload {
  apiToken: string;
  messageType: string;
  messageEncoding: string;
  destinationAddress: string;
  sourceAddress: string;
  messageText: string;
  callBackUrl?: string;
  userReferenceId?: string;
}

export interface ISMSCallbackResponse {
  messageId: string;
  operationCode: number;
  status: string;
  dlrStatus: string | null;
  destinationAddress: string;
  remarks: string;
  callBackUrl?: string;
  userReferenceId?: string;
}

export interface ISMSResponse {
  MessageId: string;
  OperationCode: number;
  Status: string;
  DlrStatus: string | null;
  DestinationAddress: string;
  Remarks: string;
  CallBackUrl?: string;
  UserReferenceId?: string;
}

export const buildOTPTextMessage = (otpCode: string, sourceAddress: string) => {
  if (!otpCode) {
    throw new Error("OTP code is required to build the text message.");
  }
  const message = `Your OTP for ${sourceAddress} ${otpCode}. Please use this code to complete your verification. Do not share this code with anyone.`;

  return message;
};

export const SMSalaURL = "https://api2.smsala.com/SendSmsV2";
