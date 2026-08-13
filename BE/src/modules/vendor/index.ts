import { FastifyInstance } from "fastify";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { buildPaginationRequest, buildRequest } from "../../types/request";
import * as schema from "./vendor.schema";

import VendorService from "./vendor.service";

export default async (fastify: FastifyInstance) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const vendorService = VendorService(fastify);
  instance.post(
    "/signup",
    {
      schema: schema.signup,
    },
    async (request: FastifyRequestTypebox<typeof schema.signup>) => {
      const response = await vendorService.signup(
        buildRequest(request.body, request.headers["x-lang"], request)
      );
      try {
        vendorService.sendEmailForAdminUponVendorRegistration({
          vendor: response,
        });
        console.log("Email sent");
      } catch (err) {
        console.log("Error happened");
        console.error(err);
      }
      return;
    }
  );

  instance.put(
    "/",
    {
      schema: schema.editProfile,
    },
    async (request: FastifyRequestTypebox<typeof schema.editProfile>) => {
      const response = await vendorService.editProfile(
        buildRequest(
          { id: request.user.id, ...request.body },
          request.headers["x-lang"],
          request
        )
      );
      return response;
    }
  );

  instance.get(
    "/",
    {
      preValidation: instance.auth([instance.isAuthenticated], {
        relation: "and",
      }),
      schema: schema.getAllVendors,
    },
    async (request: FastifyRequestTypebox<typeof schema.getAllVendors>) => {
      const { limit, offset } = request.query;
      const response = await vendorService.findAllVendors(
        buildPaginationRequest(
          limit,
          offset,
          request.headers["x-lang"],
          request,
          request.query
        )
      );
      return response;
    }
  );

  instance.get(
    "/:id",
    {
      preValidation: instance.auth([instance.isAuthenticated], {
        relation: "and",
      }),
      schema: schema.getVendorById,
    },
    async (request: FastifyRequestTypebox<typeof schema.getVendorById>) => {
      const response = await vendorService.getVendorById(
        buildRequest(request.params.id, request.headers["x-lang"], request)
      );
      return response;
    }
  );

  instance.post(
    "/get-vendor-by-token",
    {
      preValidation: instance.auth([instance.denyBlockedUser], {
        relation: "and",
      }),
      schema: schema.getVendorByToken,
    },
    async (request: FastifyRequestTypebox<typeof schema.getVendorByToken>) => {
      const response = await vendorService.findVendorByToken(
        buildRequest(
          { token: request.body.token },
          request.headers["x-lang"],
          request
        )
      );
      return response;
    }
  );

  // 	instance.put(
  // 		"/block-unblock-user/:id",
  // 		{
  // 			// preValidation: instance.auth(
  // 			//   [instance.authenticate, instance.authorizeAdmin],
  // 			//   {
  // 			//     relation: "and",
  // 			//   }
  // 			// ),
  // 			schema: schema.blockUnBlockUser,
  // 		},
  // 		async (request: FastifyRequestTypebox<typeof schema.blockUnBlockUser>) => {
  // 			const response = await userService.blockUnBlockUser(buildRequest(request.params.id, request.headers["x-lang"], request));
  // 			return response;
  // 		}
  // 	);

  // 	instance.delete(
  // 		"/:id",
  // 		{
  // 			// preValidation: instance.auth(
  // 			//   [instance.authenticate, instance.authorizeAdmin],
  // 			//   {
  // 			//     relation: "and",
  // 			//   }
  // 			// ),
  // 			schema: schema.deleteUserByAdmin,
  // 		},
  // 		async (request: FastifyRequestTypebox<typeof schema.deleteUserByAdmin>) => {
  // 			const response = await userService.deleteUserByAdmin(buildRequest(request.params.id, request.headers["x-lang"], request));
  // 			return response;
  // 		}
  // 	);

  // 	instance.post(
  // 		"/callback",
  // 		{
  // 			schema: schema.otpCallback,
  // 		},
  // 		async (request: FastifyRequestTypebox<typeof schema.otpCallback>) => {
  // 			console.log({ receivedBody: request.body });
  // 			return;
  // 		}
  // 	);
};
