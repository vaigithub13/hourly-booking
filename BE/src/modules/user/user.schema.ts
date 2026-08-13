import constants from "./../../utils/constants/shared-constants";
import { otpSendOn, otpTarget, qatariPhoneNumberType, responseMessage } from "./../../types/common-types";
import { GenderEnum, PaginatedSchema, PaginationQuerySchema, deviceSchema, headersSchema } from "./../../utils/json-schema";
import { Type } from "@sinclair/typebox";

export const userSchema = Type.Object({
	id: Type.Number(),
	phoneNumber: Type.String(),
	firstName: Type.Optional(Type.String()),
	lastName: Type.Optional(Type.String()),
	email: Type.Optional(Type.String()),
	profilePicture: Type.Optional(Type.String()),
	gender: Type.Optional(Type.String()),
	blocked: Type.Boolean(),
	verified: Type.Boolean(),
	accessToken: Type.Optional(Type.String()),
	refreshToken: Type.Optional(Type.String()),
	isDeleted: Type.Boolean(),
});

export const signUp = {
	description: "Sign up",
	headers: Type.Ref(deviceSchema),
	tags: ["Auth"],
	body: Type.Object({
		firstName: Type.Optional(Type.String({ maxLength: constants.SHORT_STRING_MAX_LENGTH })),
		lastName: Type.Optional(Type.String({ maxLength: constants.SHORT_STRING_MAX_LENGTH })),
		email: Type.Optional(
			Type.String({
				format: "email",
				maxLength: constants.SHORT_STRING_MAX_LENGTH,
			})
		),
		gender: Type.Optional(GenderEnum),
		phoneNumber: qatariPhoneNumberType,
		profilePicture: Type.Optional(Type.String()),
	}),
	response: { 201: userSchema },
};

export const askForOtp = {
	description: "Ask for otp",
	headers: Type.Ref(deviceSchema),
	tags: ["Auth"],
	querystring: Type.Object({
		sendOn: otpSendOn,
	}),
	body: Type.Object({
		emailOrPhoneNumber: Type.String(),
	}),
	response: { 200: responseMessage },
};

export const confirmOtp = {
	description: "Confirm otp",
	headers: Type.Ref(deviceSchema),
	tags: ["Auth"],
	body: Type.Object({
		emailOrPhoneNumber: Type.Union([Type.String({ format: "email" }), qatariPhoneNumberType]),
		otpCode: Type.String(),
	}),
	response: { 200: userSchema },
};

export const refreshToken = {
	description: "refresh token",
	headers: Type.Ref(deviceSchema),
	tags: ["Auth"],
	body: Type.Object({
		refreshToken: Type.String(),
	}),
	response: {
		200: userSchema,
	},
};

export const getUserByToken = {
	description: "Get user by token",
	headers: Type.Ref(deviceSchema),
	tags: ["User"],
	body: Type.Object({ token: Type.String() }),
	response: { 200: userSchema },
};

export const getUserByEmailOrPhone = {
	description: "Get user by email or phone",
	headers: Type.Ref(deviceSchema),
	tags: ["User"],
	body: Type.Object({ emailOrPhone: Type.String() }),
	response: { 200: userSchema },
};

export const editProfile = {
	description: "user profile edit by himself",
	headers: Type.Ref(deviceSchema),
	tags: ["User"],
	security: [{ userToken: [] }],
	body: Type.Object({
		userId: Type.Optional(Type.Number()),
		lastName: Type.Optional(Type.String()),
		phoneNumber: Type.Optional(qatariPhoneNumberType),
		profilePicture: Type.Optional(Type.String()),
		gender: Type.Optional(Type.String()),
		email: Type.Optional(Type.String()),
	}),
	response: { 200: userSchema },
};

export const blockUnBlockUser = {
	description: "block Or UnBlock user by admin",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["User"],
	params: Type.Object({
		id: Type.Number(),
	}),
	response: { 200: Type.Object({ result: Type.Boolean() }) },
};

export const deleteUserByAdmin = {
	description: "Delete user account by admin",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["User"],
	params: Type.Object({
		id: Type.Number(),
	}),
	response: { 200: responseMessage },
};

export const deleteMyAccountByUser = {
	description: "User can delete his account",
	headers: Type.Ref(headersSchema),
	security: [{ userToken: [] }],
	tags: ["User"],
	response: { 200: responseMessage },
};

export const getAllUsers = {
	description: "Get all users by admin",
	headers: Type.Ref(headersSchema),
	security: [{ adminToken: [] }],
	tags: ["User"],
	querystring: Type.Object({
		search: Type.Optional(Type.String()),
		verified: Type.Optional(Type.Boolean()),
		blocked: Type.Optional(Type.Boolean()),
		...PaginationQuerySchema,
	}),
	response: { 200: PaginatedSchema(userSchema) },
};

export const otpCallback = {
	description: "The callback called by SMSala",
	body: Type.Object({
		messageId: Type.String(),
		operationCode: Type.Number(),
		status: Type.String(),
		dlrStatus: Type.Union([Type.String(), Type.Null()]),
		destinationAddress: Type.String(),
		remarks: Type.String(),
		callBackUrl: Type.Optional(Type.String()),
		userReferenceId: Type.Optional(Type.String()),
	}),
};

export const resetPassword = {
	description: "reset password",
	headers: Type.Ref(headersSchema),
	tags: ["Auth"],
	security: [
		{
			userToken: [],
		},
	],
	body: Type.Object({
		currentPassword: Type.String({ minLength: 8 }),
		newPassword: Type.String({ minLength: 8 }),
	}),
};

export const confirmForgetPassword = {
	description: " confirm forget Password otp",
	headers: Type.Ref(headersSchema),
	tags: ["Auth"],
	body: Type.Object({
		phoneNumber: Type.String({ description: "phoneNumber" }),
		otpCode: Type.String(),
		newPassword: Type.String({ minLength: 8 }),
	}),
};

export const forgetPassword = {
	description: " ask for forget Password otp",
	headers: Type.Ref(headersSchema),
	tags: ["Auth"],
	body: Type.Object({
		phoneNumber: Type.String({ description: "phoneNumber" }),
	}),
};
