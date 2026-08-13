import { LangObject } from "src/types/common-types";
import { Admin } from "./admin.model";
import { AdminRole } from "./utils/admin.enum";

export enum VendorStatus {
	Approved = "Approved",
	Pending = "Pending",
	Rejected = "Rejected",
}
export interface AdminLogin {
	emailOrPhone: string;
	password: string;
}

export interface CreateVendor {
	name?: string;
	logo: string;
	email: string;
	phoneNumber: string;
	address: object;
	certificate: string;
	ownerName: string | LangObject;
	username: string;
	password: string;
}
export interface UpdateVendor {
	id: number;
	name?: string;
	logo?: string;
	email?: string;
	phoneNumber?: string;
	address?: object;
	certificate?: string;
	appPercentage?: number;
	ownerName?: string | LangObject;
	status?: VendorStatus;
	username?: string;
	blocked?: boolean;
}

export interface AdminResponse {
	id: number;
	email: string;
	phoneNumber: string;
	name?: string;
	role?: AdminRole;
	designerWallet: number;
	accessToken?: string;
	refreshToken?: string;
}

export interface VendorResponse {
	id: number;
	username: string;
	phoneNumber: string;
	name: string;
	rate: number;
	logo: string;
	ownerName: string;
	vendorName: string;
}

export interface VendorResponseLangs {
	id: number;
	username: string;
	phoneNumber: string;
	name: string;
	rate: number;
	logo: string;
	ownerName: LangObject;
	vendorName: LangObject;
}
export interface RefreshTokenDto {
	token: string;
}

export interface IUserMetaData {
	otpCode: string;
	otpCodeValidUntil?: string;
}

export interface ConfirmOtpDto {
	phoneNumber: string;
	otpCode: string;
	newPassword?: string;
}

export interface ResetPasswordDto {
	currentPassword: string;
	newPassword: string;
}

export const adminResponse = (admin: Admin, langCode: string, multiLang: boolean) => {
	const { id, email, name, vendorName, designerWallet, phoneNumber, role } = admin;
	const response: AdminResponse = {
		id,
		email,
		designerWallet,
		name: role === AdminRole.admin ? name : vendorName[langCode],
		phoneNumber,
		role,
	};

	return response;
};

export const adminVendorResponse = (vendor: Admin, langCode: string) => {
	if (!vendor) return undefined;
	const { id, username, phoneNumber, rate, name, logo, ownerName, role, vendorName } = vendor;
	const response: VendorResponse = {
		id,
		username,
		phoneNumber,
		rate,
		name,
		vendorName: vendorName[langCode],
		ownerName: role === AdminRole.admin ? name : ownerName[langCode],
		logo,
	};
	return response;
};

export const adminVendorResponseLangs = (vendor: Admin) => {
	if (!vendor) return undefined;
	const { id, username, phoneNumber, rate, name, logo, ownerName, vendorName } = vendor;
	const response: VendorResponseLangs = {
		id,
		username,
		phoneNumber,
		rate,
		name,
		vendorName: vendorName,
		ownerName: ownerName,
		logo,
	};
	return response;
};
