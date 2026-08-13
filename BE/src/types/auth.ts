export interface IUserMetaData {
  otpCode: string;
  otpCodeValidUntil?: string;
  otpType: number;
}
export enum OtpType {
  FORGET_PASSWORD = 1,
  VERIFY_ACCOUNT,
}
