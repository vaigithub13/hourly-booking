import { IPaginationQuery, OtpSendOn, OtpTarget } from "./../../types/common-types";
import { User } from "./user.model";

export interface IEditProfileDto {
	id: number;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	profilePicture?: string;
	gender?: string;
	email?: string;
}

export interface ResetPasswordDto {
	currentPassword: string;
	newPassword: string;
}

export interface IRefreshTokenDto {
	refreshToken: string;
}

export interface IGetUserByToken {
	token: string;
}

export interface ILoginDto {
	emailOrPhone: string;
}

export interface ISignUpDto {
	firstName?: string;
	lastName?: string;
	email?: string;
	profilePicture?: string;
	gender?: string;
	phoneNumber: string;
}

export interface IAskForOtpDto {
	emailOrPhoneNumber: string;
}

export interface IConfirmOtpDto {
	emailOrPhoneNumber: string;
	otpCode: string;
}

export interface IAskForOtpQueryDto {
	sendOn: OtpSendOn;
}

export interface IGetUsersQueryDto extends IPaginationQuery {
	blocked?: boolean;
	search?: string;
	verified?: boolean;
}

export interface IRefreshTokenDto {
	refreshToken: string;
}

export interface IUserResponse {
	id: number;
	email?: string;
	phoneNumber: string;
	firstName?: string;
	lastName?: string;
	gender?: string;
	profilePicture?: string;
	verified: boolean;
	blocked: boolean;
	accessToken?: string;
	refreshToken?: string;
	isDeleted: boolean;
}

export const userResponse = (user: User, langCode: string): IUserResponse => {
	const { id, email, firstName, lastName, phoneNumber, verified, blocked, profilePicture, gender, deletedAt } = user.get();
	return {
		id,
		email,
		firstName,
		lastName,
		gender,
		profilePicture,
		phoneNumber,
		verified,
		blocked,
		isDeleted: Boolean(deletedAt),
	};
};
