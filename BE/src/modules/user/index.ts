import { FastifyInstance } from "fastify";
import { FastifyRequestTypebox } from "./../../types/FastifyTypebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { buildPaginationRequest, buildRequest } from "./../../types/request";
import * as schema from "./user.schema";
import UserService from "./user.service";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const userService = UserService(fastify);

	instance.post(
		"/sign-up",
		{
			schema: schema.signUp,
		},
		async (request: FastifyRequestTypebox<typeof schema.signUp>) => {
			const response = await userService.signUp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/ask-for-otp",
		{
			preValidation: instance.auth([instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.askForOtp,
		},
		async (request: FastifyRequestTypebox<typeof schema.askForOtp>) => {
			const response = await userService.askOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.post(
		"/confirm-otp",
		{
			preValidation: instance.auth([instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.confirmOtp,
		},
		async (request: FastifyRequestTypebox<typeof schema.confirmOtp>) => {
			const response = await userService.confirmOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.put(
		"/edit-profile",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.editProfile,
		},
		async (request: FastifyRequestTypebox<typeof schema.editProfile>) => {
			const isAdmin = request?.permission.isAdmin || false;
			if ((!isAdmin && request.body.userId) || (isAdmin && !request.body.userId))
				throw instance.httpErrors.badRequest("validation error");
			let userId = request.user.id!;
			if (isAdmin) userId = request.body.userId!;
			const response = await userService.editProfile(
				buildRequest({ id: userId, ...request.body }, request.headers["x-lang"], request)
			);
			return response;
		}
	);

	instance.post(
		"/refresh-token",
		{
			schema: schema.refreshToken,
		},
		async (request: FastifyRequestTypebox<typeof schema.refreshToken>) => {
			const response = await userService.refreshToken(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.get(
		"/",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }),
			schema: schema.getAllUsers,
		},
		async (request: FastifyRequestTypebox<typeof schema.getAllUsers>) => {
			const { limit, offset } = request.query;
			const response = await userService.findAllUsers(
				buildPaginationRequest(limit, offset, request.headers["x-lang"], request, request.query)
			);
			return response;
		}
	);

	instance.post(
		"/get-user-by-token",
		{
			preValidation: instance.auth([instance.denyBlockedUser], {
				relation: "and",
			}),
			schema: schema.getUserByToken,
		},
		async (request: FastifyRequestTypebox<typeof schema.getUserByToken>) => {
			const response = await userService.findUserByToken(
				buildRequest({ token: request.body.token }, request.headers["x-lang"], request)
			);
			return response;
		}
	);

	instance.put(
		"/block-unblock-user/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.blockUnBlockUser,
		},
		async (request: FastifyRequestTypebox<typeof schema.blockUnBlockUser>) => {
			const response = await userService.blockUnBlockUser(buildRequest(request.params.id, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.delete(
		"/:id",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], {
				relation: "and",
			}),
			schema: schema.deleteUserByAdmin,
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteUserByAdmin>) => {
			const response = await userService.deleteUser(buildRequest(request.params.id, request.headers["x-lang"], request));
			return response;
		}
	);

	instance.delete(
		"/my-account",
		{
			preValidation: instance.auth([instance.authenticate, instance.authorizeUser], {
				relation: "and",
			}),
			schema: schema.deleteMyAccountByUser,
		},
		async (request: FastifyRequestTypebox<typeof schema.deleteMyAccountByUser>) => {
			const response = await userService.deleteUser(buildRequest(request.user.id, request.headers["x-lang"], request));
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
			const response = await userService.resetPassword(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);
	instance.post(
		"/ask-for-forget-password-otp",
		{
			schema: schema.forgetPassword,
		},
		async (request: FastifyRequestTypebox<typeof schema.forgetPassword>) => {
			const response = await userService.askForOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);
	instance.post(
		"/confirm-forget-password",
		{
			schema: schema.confirmForgetPassword,
		},
		async (request: FastifyRequestTypebox<typeof schema.confirmForgetPassword>) => {
			const response = await userService.confirmPasswordOtp(buildRequest(request.body, request.headers["x-lang"], request));
			return response;
		}
	);

	//   instance.post(
	//     "/callback",
	//     {
	//       schema: schema.otpCallback,
	//     },
	//     async (request: FastifyRequestTypebox<typeof schema.otpCallback>) => {
	//       console.log({ receivedBody: request.body });
	//       return;
	//     }
	//   );
};
