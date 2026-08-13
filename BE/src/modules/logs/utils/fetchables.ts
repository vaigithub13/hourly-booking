import { Includeable } from "sequelize";
import { User } from "../../user/user.model";

export const logIncludes: Includeable[] = [
	{
		model: User,
		as: "user",
		attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
	},
];

export const fetchedAttributes = {
	findAllLogs: [
		"id",
		"level",
		"category",
		"message",
		"details",
		"metadata",
		"ipAddress",
		"userAgent",
		"endpoint",
		"method",
		"statusCode",
		"responseTime",
		"errorCode",
		"stackTrace",
		"userId",
		"sessionId",
		"requestId",
		"createdAt",
		"updatedAt",
	],
};
