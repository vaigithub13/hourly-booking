import { AdminRole } from "src/modules/admin/utils/admin.enum";
import { Admin } from "./../../modules/admin/admin.model";
import { User } from "./../../modules/user/user.model";
import { JObject, UserTypeEnum } from "./../../types/common-types";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

const updateUserPreferences = async (data: {
  lang?: string;
  deviceId?: string;
  user?: User;
}) => {
  const { deviceId, lang, user } = data;
  if (!user) return;
  let toUpdateData: JObject = {};
  if (lang && user.preferredLang !== lang) {
    toUpdateData = { ...toUpdateData, preferredLang: lang };
  }
  if (deviceId && user.deviceId !== deviceId) {
    toUpdateData = { ...toUpdateData, deviceId };
  }
  await user.update({ phoneNumber: user.get("phoneNumber"), ...toUpdateData });
  return;
};

const authorizePlugin = async (instance: FastifyInstance) => {
  instance.decorate("authorizeUser", async (request: FastifyRequest) => {
    const payload = request.user;
    const lang = request.headers["x-lang"] as string;
    const deviceId = request.headers["x-deviceid"] as string | undefined;

    const user = await User.findOne({
      where: {
        id: payload.id,
        phoneNumber: payload.phoneNumber,
      },
    });

    if (!user) {
      throw instance.httpErrors.unauthorized();
    }
    if (user.blocked) {
      throw instance.httpErrors.unauthorized("user.response.blocked");
    }
    await updateUserPreferences({ deviceId, lang, user });
    request.permission.isCustomer = true;
    return user;
  });

  instance.decorate(
    "authorizeVerifiedUser",
    async (request: FastifyRequest) => {
      const payload = request.user;
      const lang = request.headers["x-lang"] as string;
      const deviceId = request.headers["x-deviceid"] as string | undefined;

      const user = await User.findOne({
        where: {
          id: payload.id,
          phoneNumber: payload.phoneNumber,
          verified: true,
        },
      });

      if (!user) {
        throw instance.httpErrors.unauthorized();
      }
      if (user.blocked) {
        throw instance.httpErrors.unauthorized("user.response.blocked");
      }
      await updateUserPreferences({ deviceId, lang, user });
      request.permission.isCustomer = true;
      return user;
    }
  );

  instance.decorate("authorizeAdmin", async (request: FastifyRequest) => {
    const payload = request.user;
    if (!payload) throw instance.httpErrors.unauthorized();
    const lang = request.headers["x-lang"] as string | undefined;

    const admin = await Admin.findOne({
      where: {
        id: payload.id,
        email: payload.email,
      },
    });
    if (!admin) {
      throw instance.httpErrors.unauthorized();
    }
    if (lang && admin.preferredLang !== lang) {
      await admin.update({ preferredLang: lang });
    }
    request.permission[
      `${admin.role === AdminRole.admin ? "isAdmin" : "isVendor"}`
    ] = true;
    return admin;
  });

  instance.decorate("authorizeVendor", async (request: FastifyRequest) => {
    const payload = request.user;
    if (!payload) throw instance.httpErrors.unauthorized();
    const lang = request.headers["x-lang"] as string | undefined;

    const vendor = await Admin.findOne({
      where: {
        id: payload.id,
        email: payload.email,
        role: AdminRole.vendor,
      },
    });
    if (!vendor) {
      throw instance.httpErrors.unauthorized();
    }
    if (lang && vendor.preferredLang !== lang) {
      await vendor.update({ preferredLang: lang });
    }
    request.permission[AdminRole.vendor] = true;
    return vendor;
  });

  instance.decorate("denyBlockedUser", async (request: FastifyRequest) => {
    if (!request.permission || request.permission.isAdmin) return;
    const payload = request.user;
    if (!payload) return;
    const deviceId = request.headers["x-deviceid"] as string | undefined;
    const lang = request.headers["x-lang"] as string;
    let user: User | null = null;
    user = await User.findByPk(payload.id);
    if (user?.blocked) {
      throw instance.httpErrors.forbidden("user.response.blocked");
    }
    await updateUserPreferences({ deviceId, lang, user: user || undefined });
    request.permission.isCustomer = true;
    return user;
  });

  instance.decorate(
    "authorizeUserResource",
    async (resource: any, userId?: number) => {
      if (!userId) return;
      if (resource.userId !== userId) {
        throw instance.httpErrors.forbidden(
          "common.response.notAllowedResource"
        );
      }
      return;
    }
  );
};

export default fp(authorizePlugin, {
  name: "authorize-plugin",
});
