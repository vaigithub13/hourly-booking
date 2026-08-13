import { idParamObject, LangObjectType, responseMessage } from "./../../types/common-types";
import { headersSchema, Nullable, TwoLangsOrOne } from "./../../utils/json-schema";
import { Type } from "@sinclair/typebox";
import { VendorStatus } from "./admin.dto";

export const AdminResponse = Type.Object({
	id: Type.Number(),
	email: Type.String(),
	phoneNumber: Type.String(),
	name: Type.Optional(Type.String()),
	role: Type.Optional(Type.String()),
	accessToken: Type.Optional(Type.String()),
	refreshToken: Type.Optional(Type.String()),
});

export const vendorAdminSchema = Type.Object({
	id: Type.Number(),
	username: Type.String(),
	phoneNumber: Type.String(),
	name: Nullable(Type.String()),
	logo: Type.String(),
	rate: Type.Number(),
	ownerName: TwoLangsOrOne,
	vendorName: TwoLangsOrOne,
});

export const login = {
	description: "login",
	headers: Type.Ref(headersSchema),
	tags: ["Admin"],
	body: Type.Object({
		emailOrPhone: Type.String(),
		password: Type.String({ minLength: 8 }),
	}),
	response: {
		201: AdminResponse,
	},
};

export const createVendor = {
	description: "Create Vendor",
	headers: Type.Ref(headersSchema),
	tags: ["Admin"],
	body: Type.Object({
		email: Type.String(),
		phoneNumber: Type.String(),
		vendorName: LangObjectType,
		ownerName: LangObjectType,
		username: Type.String(),
		password: Type.String({ minLength: 8 }),
		logo: Type.String(),
		address: Type.Object({
			unit: Type.String(),
			street: Type.String(),
			building: Type.String(),
			zone: Type.String(),
			longitude: Type.Optional(Type.Number()),
			latitude: Type.Optional(Type.Number()),
		}),
		certificate: Type.String(),
	}),
	response: {
		201: Type.Any(),
	},
};
export const updateVendor = {
	description: "Update Vendor",
	headers: Type.Ref(headersSchema),
	tags: ["Admin"],
	params: Type.Object({
		id: Type.Number({ minimum: 1 }),
	}),
	body: Type.Object({
		email: Type.String(),
		phoneNumber: Type.Optional(Type.String()),
		vendorName: Type.Optional(LangObjectType),
		ownerName: Type.Optional(LangObjectType),
		username: Type.Optional(Type.String()),
		password: Type.Optional(Type.String({ minLength: 8 })),
		logo: Type.Optional(Type.String()),
		designerWallet: Type.Optional(Type.Number()),
		address: Type.Optional(
			Type.Object({
				unit: Type.Optional(Type.String()),
				street: Type.Optional(Type.String()),
				building: Type.Optional(Type.String()),
				zone: Type.Optional(Type.String()),
				longitude: Type.Optional(Type.Number()),
				latitude: Type.Optional(Type.Number()),
			})
		),
		appPercentage: Type.Optional(Type.Number({ minimum: 0, maximum: 20 })),
		certificate: Type.Optional(Type.String()),
		status: Type.Optional(Type.Enum(VendorStatus)),
		blocked: Type.Optional(Type.Boolean()),
	}),
	response: {
		201: Type.Any(),
	},
};

export const refreshToken = {
	description: "refresh-token",
	headers: Type.Ref(headersSchema),
	tags: ["Admin"],
	body: Type.Object({
		token: Type.String(),
	}),
	response: {
		201: AdminResponse,
	},
};

export const getAdminByToken = {
	description: "get admin by token",
	tags: ["Admin"],
	security: [{ adminToken: [] }],
	response: {
		200: AdminResponse,
	},
};

export const approveUser = {
	description: "approve user",
	tags: ["Admin"],
	security: [{ adminToken: [] }],
	params: idParamObject,
	response: {
		200: responseMessage,
	},
};

export const getStatistics = {
	description: "get statistics",
	tags: ["Admin"],
	security: [{ adminToken: [] }],
	response: {
		200: Type.Object({
			totalProfit: Type.Number(),
			activeUsersCount: Type.Number(),
			mostBoughtPack: Type.Number(),
		}),
	},
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
		emailOrPhoneNumber: Type.String({ description: "email or phoneNumber" }),
		otpCode: Type.String(),
		newPassword: Type.String({ minLength: 8 }),
	}),
};

export const forgetPassword = {
	description: " ask for forget Password otp",
	headers: Type.Ref(headersSchema),
	tags: ["Auth"],
	body: Type.Object({
		emailOrPhoneNumber: Type.String({ description: "email or phoneNumber" }),
	}),
};
