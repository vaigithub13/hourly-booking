import { FastifyInstance } from "fastify";
import AdminService from "./admin.service";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import * as schema from "./admin.schema";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { buildRequest } from "./../../types/request";
import constants from "./../../utils/constants/shared-constants";
import { VendorStatus } from "./admin.dto";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const adminService = AdminService(fastify);

	instance.post(
		"/login",
		{
			schema: schema.login,
		},
		async (request: FastifyRequestTypebox<typeof schema.login>) => {
			const response = await adminService.login(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/create-vendor",
		{
			schema: schema.createVendor,
			// preValidation: instance.auth(
			//   [instance.authenticate, instance.authorizeAdmin],
			//   { relation: "and" }
			// ),
		},
		async (request: FastifyRequestTypebox<typeof schema.createVendor>) => {
			const response = await adminService.createVendor(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post("/refreshToken", { schema: schema.refreshToken }, async (request: FastifyRequestTypebox<typeof schema.refreshToken>) => {
		const response = await adminService.refreshToken(buildRequest(request.body, request.headers["x-lang"], request));
		return response;
	});

	instance.patch(
		"/update-vendor/:id",
		{
			schema: schema.updateVendor,
			// preValidation: instance.auth(
			//   [instance.authenticate, instance.authorizeAdmin],
			//   { relation: "and" }
			// ),
		},
		async (request: FastifyRequestTypebox<typeof schema.updateVendor>) => {
			const vendor = await adminService.findVendorById(request.params.id);
			const response = await adminService.updateVendor(
				buildRequest({ ...request.body, id: request.params.id }, request.headers["x-lang"], request)
			);

			const updatedStatus = request.body.status;
			if (updatedStatus && updatedStatus !== VendorStatus.Pending) {
				try {
					adminService.sendApproveOrRejectionVendorEmail({
						vendor,
						newStatus: updatedStatus,
					});
				} catch (err) {
					console.error(err);
				}
			}
			return response;
		}
	);
	instance.get(
		"/getAdminByToken",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.getAdminByToken,
		},
		async (request: FastifyRequestTypebox<typeof schema.getAdminByToken>) => {
			const response = await adminService.getAdminByToken(buildRequest(request.user.id, constants.ADMIN_MAIN_LANG, request));
			return response;
		}
	);

	instance.post(
		"/reset-password",
		{
			preValidation: instance.auth([instance.authenticate], {
				relation: "and",
			}),
			schema: schema.resetPassword,
		},
		async (request: FastifyRequestTypebox<typeof schema.resetPassword>) => {
			const response = await adminService.resetPassword(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/ask-for-forget-password-otp",
		{
			schema: schema.forgetPassword,
		},
		async (request: FastifyRequestTypebox<typeof schema.forgetPassword>) => {
			const response = await adminService.askForOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);
	instance.post(
		"/confirm-forget-password",
		{
			schema: schema.confirmForgetPassword,
		},
		async (request: FastifyRequestTypebox<typeof schema.confirmForgetPassword>) => {
			const response = await adminService.confirmOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);
};
