import { FastifyInstance } from "fastify";
import { PaginatedRequest, RequestData } from "./../../types/request";
import {
	IAskForOtpDto,
	IAskForOtpQueryDto,
	IConfirmOtpDto,
	IEditProfileDto,
	IGetUserByToken,
	IGetUsersQueryDto,
	IRefreshTokenDto,
	ISignUpDto,
	ResetPasswordDto,
	userResponse,
} from "./user.dto";
import { JwtInterface } from "./../../plugins/jwt";
import { User } from "./user.model";
import { UserFilterService } from "./utils/user.filter-service";
import { Includeable } from "sequelize";
import { fetchedAttributes, userIncludes } from "./utils/fetchables";
import { hashPassword, translateMessage } from "./../../utils/common-methods";
import { OtpSendOn, OtpTarget, UserTypeEnum } from "./../../types/common-types";
import { IUserMetaData, OtpType } from "./../../types/auth";
import { myDayjs } from "./../../utils/dayjs/my-dayjs";
import { ConfirmOtpDto } from "../admin/admin.dto";
import { generateOtp } from "src/plugins/otp/generate-otp";

const UserService = (instance: FastifyInstance) => {
	const privateMethods = {
		generateTokens: (user: User) => {
			const { id, email, phoneNumber, blocked, verified } = user.get();
			const payload: JwtInterface = {
				id,
				email,
				phoneNumber,
				blocked,
				verified,
				role: UserTypeEnum.USER,
			};
			const accessToken = instance.jwt.sign(payload, {
				expiresIn: instance.configs.jwt.expire,
			});
			const refreshToken = instance.jwt.sign(payload, {
				expiresIn: instance.configs.jwt.refreshTokenExpire,
			});
			return { accessToken, refreshToken };
		},

		generateOtp: (otpType: number): IUserMetaData => {
			return {
				otpCode: `${Math.floor(Math.random() * 8999) + 1000}`,
				otpCodeValidUntil: myDayjs().add(instance.configs.otp.validUntil, "minute").format(),
				otpType,
			};
		},

		getMetaDataType: (otpType: number) => {
			if (otpType == OtpType.FORGET_PASSWORD) return "forgetPasswordOtpMetaData";
			if (otpType == OtpType.VERIFY_ACCOUNT) return "verifyOtpMetaData";
			return "";
		},

		checkAskForOtp: (metaData?: IUserMetaData) => {
			if (metaData?.otpCodeValidUntil && myDayjs(metaData.otpCodeValidUntil).isAfter(myDayjs())) {
				throw instance.httpErrors.badRequest("user.otp.wait");
			}
			return true;
		},

		checkValidateOtp: (data: { metaData?: IUserMetaData; otpCode: string }) => {
			const { metaData, otpCode } = data;
			if (!metaData || !metaData.otpCode || !metaData.otpCodeValidUntil || !metaData.otpType) throw instance.httpErrors.badRequest();
			if (metaData.otpCode != otpCode) {
				throw instance.httpErrors.badRequest("user.otp.wrong");
			}
			if (myDayjs(metaData.otpCodeValidUntil).isBefore(myDayjs())) {
				throw instance.httpErrors.badRequest("user.otp.notValid");
			}
			return true;
		},

		filterGetUsersList: (query?: IGetUsersQueryDto) => {
			if (!query) return undefined;
			const { search, blocked, verified } = query;
			const customerFilter = new UserFilterService();

			if (search)
				customerFilter
					.startsWithInsensitive("firstName", search, true)
					.startsWithInsensitive("lastName", search, true)
					.startsWithInsensitive("email", search, true)
					.substringInsensitive("phoneNumber", search, true);

			if (blocked !== undefined) customerFilter.equals("blocked", blocked);
			if (verified !== undefined) customerFilter.equals("verified", verified);

			return customerFilter.build();
		},

		attachTokens: (user: User, langCode: string) => {
			const response = userResponse(user, langCode);
			const { accessToken, refreshToken } = privateMethods.generateTokens(user);
			response.accessToken = accessToken;
			response.refreshToken = refreshToken;
			return response;
		},
	};

	const service = {
		findById: async (data: { id: number; fullInfo?: boolean; paranoid?: boolean }) => {
			const { id, fullInfo, paranoid } = data;
			const user = await User.findOne({
				where: { id },
				paranoid,
				include: fullInfo ? userIncludes : undefined,
			});
			if (!user) throw instance.httpErrors.notFound("user.response.notFound");
			return user;
		},

		findByPhoneNumber: async (phoneNumber: string, fullInfo?: boolean) => {
			let include: Includeable[] = [];
			if (fullInfo) include = userIncludes;

			const user = await User.findOne({
				where: { phoneNumber },
				include,
			});
			if (!user) throw instance.httpErrors.notFound("user.response.notFound");
			return user;
		},

		findByEmailOrPhoneNumber: async (data: string, fullInfo?: boolean) => {
			let include: Includeable[] = [];
			if (fullInfo) include = userIncludes;

			const user = await User.findOne({
				where: new UserFilterService().equals("email", data, true).equals("phoneNumber", data, true).build(),
				include,
			});

			if (!user) throw instance.httpErrors.badRequest("user.response.notFound");
			return user;
		},

		signUp: async (dto: RequestData<ISignUpDto>) => {
			const { data } = dto;
			let user = await User.findOne({
				where: { phoneNumber: data.phoneNumber },
			});

			if (user) throw instance.httpErrors.badRequest("user.response.existsPhoneNumber");

			if (data.email) {
				user = await User.findOne({ where: { email: data.email } });
				if (user) throw instance.httpErrors.badRequest("user.response.existsEmail");
			}

			const deviceId = dto.request?.headers["x-deviceid"] as string;

			let createdUser = await User.create({
				email: data.email,
				phoneNumber: data.phoneNumber,
				firstName: data.firstName,
				lastName: data.lastName,
				profilePicture: data.profilePicture,
				deviceId,
				gender: data.gender,
			});

			// Log successful signup
			await instance.customLog.userAction(`User successfully signed up`, createdUser.id, {
				phoneNumber: data.phoneNumber,
				email: data.email,
				deviceId,
			});

			createdUser = await service.findById({ id: createdUser.id });
			const response = privateMethods.attachTokens(createdUser, dto.langCode);
			return response;
		},

		askOtp: async (dto: RequestData<IAskForOtpDto>) => {
			const { emailOrPhoneNumber } = dto.data;
			const query = (await dto.request?.query) as IAskForOtpQueryDto;
			const sendOn = query.sendOn;

			let user: User | null = null;
			if (sendOn === OtpSendOn.Phone) {
				user = await User.findOne({
					where: { phoneNumber: emailOrPhoneNumber },
				});
				if (!user) throw instance.httpErrors.notFound("user.response.notFoundByPhoneNumber");
			} else {
				user = await User.findOne({
					where: { email: emailOrPhoneNumber },
				});
				if (!user) throw instance.httpErrors.notFound("user.response.notFoundByEmail");
			}

			if (sendOn === OtpSendOn.Phone) {
				if (user.get("email") === emailOrPhoneNumber) {
					throw instance.httpErrors.badRequest("user.response.emailProvidedAndTargetIsPhone");
				}
			} else {
				if (user.get("phoneNumber") === emailOrPhoneNumber) {
					throw instance.httpErrors.badRequest("user.response.phoneNumberProvidedAndTargetIsEmail");
				}
			}

			privateMethods.checkAskForOtp(user.get("verifyOtpMetaData"));
			const generatedOtp = privateMethods.generateOtp(OtpType.VERIFY_ACCOUNT);

			if (sendOn == OtpSendOn.Email) {
				await instance.sendOtpEmail(emailOrPhoneNumber, generatedOtp.otpCode);
			} else {
				await instance.sendSMS(emailOrPhoneNumber, generatedOtp.otpCode);
			}
			await user.update({ verifyOtpMetaData: generatedOtp });
			return {
				message: translateMessage("common.response.success", dto.langCode),
			};
		},

		confirmOtp: async (dto: RequestData<IConfirmOtpDto>) => {
			const { otpCode, emailOrPhoneNumber } = dto.data;
			const user = await service.findByEmailOrPhoneNumber(emailOrPhoneNumber, true);
			const bypassAllowed = instance.configs.instance.env !== "production" && process.env.ENABLE_OTP_BYPASS === "true";
if (bypassAllowed && otpCode === "3489") {
    // dev/staging only — lets a mobile dev log in without real SMS delivery
} else {
    privateMethods.checkValidateOtp({
        otpCode,
        metaData: user.get("verifyOtpMetaData"),
    });
}
			const deviceId = dto.request?.headers?.["x-deviceid"] || undefined;
			await user.update({ verified: true, verifyOtpMetaData: null, deviceId });

			return privateMethods.attachTokens(user, dto.langCode);
		},

		editProfile: async (dto: RequestData<IEditProfileDto>) => {
			const { id } = dto.data;

			const user = await service.findById({ id });

			const updatedObject = { verified: user.verified, ...dto.data };
			if (dto.data.phoneNumber) {
				const existingUser = await User.findOne({
					where: { phoneNumber: dto.data.phoneNumber },
				});
				if (existingUser && existingUser.get("id") !== user.get("id")) {
					throw instance.httpErrors.badRequest("user.response.usedPhoneNumber");
				}
			}

			if (dto.data.email) {
				const existingUser = await User.findOne({
					where: { email: dto.data.email },
				});
				if (existingUser && existingUser.get("id") !== user.get("id")) {
					throw instance.httpErrors.badRequest("user.response.usedPhoneNumber");
				}
			}

			if (dto.data.phoneNumber && dto.data.phoneNumber !== user.get("phoneNumber")) updatedObject.verified = false;

			await user.update({
				...updatedObject,
			});

			return privateMethods.attachTokens(user, dto.langCode);
		},

		refreshToken: async (dto: RequestData<IRefreshTokenDto>) => {
			const { data } = dto;
			if (!data) throw instance.httpErrors.badRequest();

			const payload = instance.jwt.decode<JwtInterface>(data.refreshToken!);
			if (!payload) {
				throw instance.httpErrors.unauthorized("user.refreshToken.expired");
			}
			try {
				instance.jwt.verify(data.refreshToken);
			} catch (error) {
				throw instance.httpErrors.unauthorized();
			}
			const user = await service.findById({ id: payload.id });
			const response = privateMethods.attachTokens(user, dto.langCode);
			return response;
		},

		findAllUsers: async (dto: PaginatedRequest<IGetUsersQueryDto>) => {
			const query = dto.data;
			const { count, rows } = await User.findAndCountAll({
				where: privateMethods.filterGetUsersList(query),
				attributes: fetchedAttributes.findAllUsers,
				limit: dto.limit,
				offset: dto.offset,
				paranoid: dto.request?.permission.isAdmin,
			});
			return {
				count,
				rows: rows.map((user: User) => userResponse(user, dto.langCode)),
			};
		},

		findUserByToken: async (dto: RequestData<IGetUserByToken>) => {
			const token = dto.data.token;
			instance.jwt.verify(token);

			const { id } = instance.jwt.decode(token) as JwtInterface;
			const user = await service.findById({ id, fullInfo: true });

			return userResponse(user, dto.langCode);
		},

		blockUnBlockUser: async (dto: RequestData<number>) => {
			const user = await service.findById({ id: dto.data });
			await user.update({ blocked: !user.get("blocked") });
			return {
				result: true,
			};
		},

		deleteUser: async (dto: RequestData<number>) => {
			const user = await service.findById({ id: dto.data });
			await user.destroy();
			return {
				message: translateMessage("common.response.success", dto.langCode),
			};
		},

		// Statistics
		totalUsersCount: async () => {
			const usersCount = await User.count();
			return usersCount;
		},
		verifiedUsersCount: async () => {
			const usersCount = await User.count({ where: { verified: true } });
			return usersCount;
		},
		resetPassword: async (dto: RequestData<ResetPasswordDto>) => {
			const { data, request } = dto;
			if (!request?.user) throw instance.httpErrors.unauthorized("common.response.unauthorized");
			const user = await service.findById({ id: request.user.id });
			const currentPassword = await request.verify(data.currentPassword, user.password);
			if (!currentPassword) throw instance.httpErrors.badRequest("user.password.unmatched");
			const newPassword = await request.hash(data.newPassword);
			await user.update({ password: newPassword });
			return userResponse(user, dto.langCode);
		},
		askForOtp: async (dto: RequestData<{ phoneNumber: string }>) => {
			const { data } = dto;
			const user = await service.findByEmailOrPhoneNumber(data.phoneNumber);

			privateMethods.checkAskForOtp();
			const otp = generateOtp(instance);
			await user.update({
				forgetPasswordOtpMetaData: otp,
			});
			let toSendOtpPhoneNumber = user.phoneNumber;
			if (user.phoneNumber.substring(0, 4) !== "974") toSendOtpPhoneNumber = "974" + user.phoneNumber;
			await instance.sendSMS(toSendOtpPhoneNumber, `${otp.otpCode}`);
			// await instance.sendOtpEmail(user.email, otp.otpCode);
			return {
				message: "user.otp.sent",
			};
		},
		confirmPasswordOtp: async (dto: RequestData<{ phoneNumber: string; newPassword: string; otpCode: string }>) => {
			const { data, request } = dto;

			const user = await service.findByEmailOrPhoneNumber(data.phoneNumber);

			privateMethods.checkValidateOtp({ metaData: user.forgetPasswordOtpMetaData, otpCode: data.otpCode || "" });
			const password = await request!.hash(data.newPassword!);
			await user.update({
				password: password,
				forgetPasswordOtpMetaData: {
					otpCode: null,
					otpCodeValidUntil: null,
				},
			});

			const userDetails = await service.findById(user.id);
			const response = userResponse(userDetails, dto.langCode);
			const tokens = privateMethods.generateTokens(user);
			response.accessToken = tokens.accessToken;
			response.refreshToken = tokens.refreshToken;
			return response;
		},
	};
	return service;
};

export default UserService;
