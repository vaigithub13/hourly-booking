import { FastifyInstance } from "fastify";
import { PaginatedRequest, RequestData } from "../../types/request";
import { IEditProfileDto, IGetVendorByToken, IGetVendorQueryDto, vendorResponse, VendorSignup } from "./vendor.dto";
import { JwtInterface } from "../../plugins/jwt";
import { UserTypeEnum } from "../../types/common-types";
import { AdminFilterService } from "../admin/utils/admin.filter-service";
import { promisify } from "util";
import crypto from "crypto";
const scrypt = promisify(crypto.scrypt);
import { Admin } from "../admin/admin.model";
import { AdminRole } from "../admin/utils/admin.enum";
import { User } from "../user/user.model";
import { VendorStatus } from "../admin/admin.dto";
import { orderCriteria } from "src/utils/common-methods";
import ConfigurationService from "../configuration/configuration.service";
import { generateNewVendorRegistrationNotificationEmail } from "./utils/emails";
import { Sequelize } from "sequelize-typescript";
import { Product } from "../product/product.model";
import { Op, Order } from "sequelize";

const VendorService = (instance: FastifyInstance) => {
	const privateMethods = {
		generateTokens: (admin: Admin) => {
			const { id, email, phoneNumber } = admin.get();
			const payload: JwtInterface = {
				id,
				email,
				phoneNumber,
				blocked: false,
				verified: true,
				role: AdminRole.vendor,
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
			const response = vendorResponse(admin, langCode, true);
			const { accessToken, refreshToken } = privateMethods.generateTokens(admin);

			response.accessToken = accessToken;
			response.refreshToken = refreshToken;

			return response;
		},
		// filterGetVendorsList: (query?: IGetVendorsQueryDto) => {
		// 	if (!query) return undefined;
		// 	const { search, blocked, verified } = query;
		// 	const customerFilter = new VendorFilterService();
		// 	if (search)
		// 		customerFilter.startsWith("name", search, true).startsWith("email", search, true).substring("phoneNumber", search, true);
		// 	if (blocked !== undefined) customerFilter.equals("blocked", blocked);
		// 	if (verified !== undefined) customerFilter.equals("verified", verified);
		// 	return customerFilter.build();
		// },
	};

	const service = {
		findById: async (id: number) => {
			const vendor = await Admin.findOne({
				where: { id, role: AdminRole.vendor },
			});
			if (!vendor) throw instance.httpErrors.notFound("vendor.response.notFound");
			return vendor;
		},

		signup: async (dto: RequestData<VendorSignup>) => {
			const { phoneNumber, email, username } = dto.data;
			const filters = new AdminFilterService()
				.equals("phoneNumber", email, true)
				.equals("email", phoneNumber, true)
				.equals("username", username, true);
			const vendor = await Admin.findOne({ where: filters.build() });
			if (vendor) {
				throw instance.httpErrors.badRequest("admin.response.alreadyRegistered");
			}
			const salt = crypto.randomBytes(8).toString("hex");
			const derivedKey = (await scrypt(dto.data.password, salt, 64)) as Buffer;
			const hashedPassword = `${salt}:${derivedKey.toString("hex")}`;

			const createdVendor = await Admin.create({
				...dto.data,
				password: hashedPassword,
				status: VendorStatus.Pending,
			});

			return createdVendor;
		},

		getOne: async (id: number) => {},

		getVendorById: async (dto: RequestData<number>) => {
			const vendor = await service.findById(dto.data);
			const isAdminOrVendor = dto.request?.permission.isAdmin || dto.request?.permission.isVendor || false;
			return vendorResponse(vendor, dto.langCode, isAdminOrVendor);
		},

		editProfile: async (dto: RequestData<IEditProfileDto>) => {
			const { id } = dto.data;

			const vendor = await service.findById(id);

			const updatedObject = { verified: vendor.get("approved"), ...dto.data };

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
			if (
				(dto.data.phoneNumber && dto.data.phoneNumber !== vendor.get("phoneNumber")) ||
				(dto.data.username && dto.data.username !== vendor.get("username")) ||
				(dto.data.email && dto.data.email !== vendor.get("email"))
			)
				updatedObject.verified = false;

			await vendor.update({
				...updatedObject,
			});

			return privateMethods.attachTokens(vendor, dto.langCode);
		},

		findAllVendors: async (dto: PaginatedRequest<IGetVendorQueryDto>) => {
			const query = dto.data as IGetVendorQueryDto;
			const adminFilterService = new AdminFilterService();

			if (query.search) {
				adminFilterService.substringLangObjectOR("vendorName", query.search, true);
				adminFilterService.startsWithInsensitive("email", query.search, true);
				adminFilterService.startsWithInsensitive("phoneNumber", query.search, true);
			}
			const isAdmin = dto.request?.user?.role === UserTypeEnum.ADMIN || dto.request?.user?.role === UserTypeEnum.VENDOR;

			if (query.status !== undefined) {
				adminFilterService.equals("status", query.status);
			}

			if (query.blocked !== undefined) {
				adminFilterService.equals("blocked", query.blocked);
			}

			if (query.rate) {
				adminFilterService.numberBetween("rate", query.rate, query.rate + 1, undefined, Op.lt);
			}

      if (!isAdmin) {
        adminFilterService.equals('blocked', false);
        adminFilterService.equals('status', VendorStatus.Approved);
      }

			adminFilterService.equals("role", AdminRole.vendor);

			let ordering: any = query.sort || query.sortBy ? orderCriteria({ sort: query.sort, sortBy: query.sortBy }) : [];
			ordering.push([Sequelize.literal('"productCount"'), "DESC"]);
			const { count, rows } = await Admin.findAndCountAll({
				where: adminFilterService.build(),
				limit: dto.limit,
				offset: dto.offset,
				attributes: {
					include: [
						// Include all admin attributes
						...Object.keys(Admin.getAttributes()),
						// Add product count
						[Sequelize.fn("COUNT", Sequelize.col("products.id")), "productCount"],
					],
				},
				include: [
					{
						model: Product,
						attributes: [], // Just for counting
						required: false, // LEFT JOIN to include admins with no products
					},
				],
				group: ["Admin.id"], // Group by admin primary key
				order: ordering,
				subQuery: false, // Important for pagination to work with GROUP BY
			});
			return {
				count: count.length,
				rows: rows.map((vendor: Admin) => vendorResponse(vendor, dto.langCode, dto.request?.permission.isAdmin || false)),
			};
		},

		findVendorByToken: async (dto: RequestData<IGetVendorByToken>) => {
			const token = dto.data.token;
			instance.jwt.verify(token);

			const { id } = instance.jwt.decode(token) as JwtInterface;
			const vendor = await service.findById(id);

			return vendorResponse(vendor, dto.langCode, dto.request?.permission.isAdmin || false);
		},

		sendEmailForVendorOfOrderCancelOrReturn: async (data: { user: User; orderId: number; action: "cancelled" | "returned" }) => {
			const { orderId, user, action } = data;
			const userEmail = user.get("email");
			if (!userEmail) return;
			await instance.sendCancelOrReturnOrderVendorEmail({
				action,
				from: instance.configs.sendGrid.sender,
				orderId,
				subject: action === "cancelled" ? "Order Cancellation" : "Order Return",
				to: userEmail,
				userName: user.get("firstName") || userEmail,
			});
		},

		sendEmailForAdminUponVendorRegistration: async (data: { vendor: Admin }) => {
			const { vendor } = data;
			const vendorName = vendor.vendorName["en"];
			const configsService = ConfigurationService(instance);
			const configs = await configsService.find();
			const adminEmail = configs.get("eventsReceivingEmail");
			if (!adminEmail) return;
			instance.sendCustomEmail({
				emailAddress: adminEmail,
				subject: "New Vendor Registration",
				htmlTemplate: generateNewVendorRegistrationNotificationEmail({
					vendorName: vendor.get("username") || "",
					dashboardLink: `${instance.configs.instance.feHost}/dashboard/admin/vendors`,
				}),
			});
			return true;
		},
		// blockUnBlockVendor: async (dto: RequestData<number>) => {
		// 	const vendor = await service.findById(dto.data);
		// 	await vendor.update({ blocked: !vendor.get("blocked") });
		// 	return {
		// 		result: true,
		// 	};
		// },

		// deleteVendorByAdmin: async (dto: RequestData<number>) => {
		// 	const vendor = await service.findById(dto.data);
		// 	await vendor.destroy();
		// 	return {
		// 		message: translateMessage("common.response.success", dto.langCode),
		// 	};
		// },

		// // Statistics
		// totalVendorsCount: async () => {
		// 	const vendorsCount = await Vendor.count();
		// 	return vendorsCount;
		// },
		// verifiedVendorsCount: async () => {
		// 	const vendorsCount = await Vendor.count({ where: { verified: true } });
		// 	return vendorsCount;
		// },
	};
	return service;
};

export default VendorService;
