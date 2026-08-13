import { Includeable } from "sequelize";
import { User } from "src/modules/user/user.model";

export const walletIncludes = (): Includeable[] => {
  const includes: Includeable[] = [User];
  return includes;
};
