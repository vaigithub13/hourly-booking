import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import "@fastify/jwt";
import { UserTypeEnum } from "./../../types/common-types";
import { AdminRole } from "../../modules/admin/utils/admin.enum";
import { User } from "src/modules/user/user.model";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number }; // payload type is used for signing and verifying
    user: {
      id: number;
      email?: string;
      phoneNumber: string;
      blocked: boolean;
      verified: boolean;
      role: UserTypeEnum;
    };
  }
}
export interface JwtInterface {
  id: number;
  email?: string;
  phoneNumber: string;
  blocked: boolean;
  verified: boolean;
  role: UserTypeEnum | AdminRole;
}

const attachPermissions = (request: FastifyRequest) => {
  request.permission = { isAdmin: false, isCustomer: false, isVendor: false };
  return;
};
const setReqPermissions = (request: FastifyRequest) => {
  const role = request.user.role;
  if (role === UserTypeEnum.ADMIN) request.permission.isAdmin = true;
  else if (role === UserTypeEnum.USER) request.permission.isCustomer = true;
  else request.permission.isVendor = true;
  return;
};

const jwtPlugin = async (instance: FastifyInstance) => {
  instance.register(import("@fastify/jwt"), {
    secret: instance.configs.jwt.secret,
  });

  instance.addHook("preHandler", async (request: FastifyRequest) => {
    if (!request.permission) attachPermissions(request);
    if (!request.user) {
      try {
        await request.jwtVerify();
      } catch (error) {}
    }
    return;
  });

  instance.decorate("authenticate", async (request: FastifyRequest) => {
    if (!request.permission) attachPermissions(request);
    try {
      await request.jwtVerify();
      setReqPermissions(request);
    } catch (error) {
      throw instance.httpErrors.unauthorized();
    }
  });

  // check if user is authenticated without throwing error
  instance.decorate("isAuthenticated", async (request: FastifyRequest) => {
    if (!request.permission) attachPermissions(request);
    try {
      await request.jwtVerify();
      setReqPermissions(request);
    } catch (error) {
      return;
    }
  });
};

export default fp(jwtPlugin, {
  name: "jwt-plugin",
});
