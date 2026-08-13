import { getConfigs } from "./../configs/index";
import { Admin } from "./../modules/admin/admin.model";
import crypto from "crypto";
import { promisify } from "util";
import constants from "./constants/shared-constants";
import { AdminRole } from "src/modules/admin/utils/admin.enum";
const scrypt = promisify(crypto.scrypt);

export const seedAdmin = async (
  configs: Awaited<ReturnType<typeof getConfigs>>
) => {
  const admin = await Admin.findOne({ where: { role: AdminRole.admin } });
  if (!admin) {
    const salt = crypto.randomBytes(8).toString("hex");
    const derivedKey = (await scrypt(
      configs.admin.password,
      salt,
      64
    )) as Buffer;
    const password = `${salt}:${derivedKey.toString("hex")}`;
    await Admin.create({
      name: "Admin",
      email: configs.admin.email,
      password,
      phoneNumber: "+97411111111",
      role: AdminRole.admin,
      preferredLang: constants.ADMIN_MAIN_LANG,
    });
  }
  return;
};
