import { Includeable } from "sequelize";

// This file to put the includes in it
export const userIncludes: Includeable[] = [];

export const fetchedAttributes = {
  findAllUsers: [
    "id",
    "firstName",
    "lastName",
    "phoneNumber",
    "email",
    "verified",
    "blocked",
    "gender",
  ],
};
