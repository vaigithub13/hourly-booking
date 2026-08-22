import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import helmet from "@fastify/helmet";
import { getConfigs } from "./configs";
import { Sequelize } from "sequelize-typescript";
import { Multipart } from "@fastify/multipart";
import pino from "pino";
import pretty from "pino-pretty";
import modules from "./modules";
import fastifyAuth from "@fastify/auth";
import fastifySwagger from "@fastify/swagger";
import { User } from "./modules/user/user.model";
import { Admin } from "./modules/admin/admin.model";
import { seedAdmin } from "./utils/admin-seeding";
import { seedDemoBookingData } from "./utils/demo-seeding";
import { setFastifyInstance } from "./fastifyInstance";
import { notificationDto } from "./modules/notification/dto";
import { IDynamicTemplateConfirmOrderEmailData, ISendVendorOrderNotificationEmail } from "./plugins/sendGrid/templates/interfaces";
import { runOnAppInit } from "./utils/on-app-init";

declare module "fastify" {
	interface FastifyInstance {
		// get configs everywhere
		configs: Awaited<ReturnType<typeof getConfigs>>;
		// database connection instance
		db: Sequelize;
		// check jwt if exists
		authenticate: (request: FastifyRequest) => void;

		isAuthenticated: (request: FastifyRequest) => void;

		// authorize users with user role
		authorizeUser: (request: FastifyRequest) => Promise<User>;

		authorizeVerifiedUser: (request: FastifyRequest) => Promise<User>;

		authorizeUserResource: (resource: any, userId?: number) => Promise<void>;

		// authorize users with admin role
		authorizeAdmin: (request: FastifyRequest) => Promise<Admin>;

		authorizeVendor: (request: FastifyRequest) => Promise<Admin>;

		sendNotification: (notification: notificationDto) => Promise<void>;
		sendPublicNotification: (notification: notificationDto) => Promise<void>;

		denyBlockedUser: (request: FastifyRequest) => Promise<User | null | undefined>;

		encryptBalance: (balance: string | number) => Promise<string>;

		decryptBalance: (balance: string) => Promise<string>;

		sendSMS: (phoneNumber: string, otpCode: string) => Promise<boolean>;

		// Sendgrid methods
		sendOtpEmail: (email: string, otp: string) => Promise<void>;

		sendCustomEmail: (data: { emailAddress: string; htmlTemplate: string; subject: string }) => Promise<void>;

		sendUpdateOrderStatusEmail(payload: { email: string; status: string; orderId: string }): Promise<void>;
		sendEmailUsingTemplate: (emailData: IDynamicTemplateConfirmOrderEmailData) => Promise<boolean>;

		sendCancelOrReturnOrderVendorEmail: (emailData: ISendVendorOrderNotificationEmail) => Promise<boolean>;

		searchRevGeocoding: (data: { lng: string; lat: string; searchLocation: string }) => Promise<boolean>;

		// authorize users with user role

		// sendNotification: (notification: INotificationBody) => Promise<void>;

		// aws s3 helper methods
		uploadFile: (parts: Multipart[], folder: string) => Promise<string[]>;

		uploadFileBase64: (base64: string) => Promise<unknown>;
		getPictureURL: (fileName: string) => string;

		// custom logging methods
		customLog: {
			info: (message: string, data?: any) => Promise<void>;
			error: (message: string, error?: Error, data?: any) => Promise<void>;
			warn: (message: string, data?: any) => Promise<void>;
			debug: (message: string, data?: any) => Promise<void>;
			userAction: (message: string, userId: number, data?: any) => Promise<void>;
			adminAction: (message: string, userId: number, data?: any) => Promise<void>;
		};
	}
	interface FastifyRequest {
		// hash a string using crypto builtin module
		hash: (text: string) => Promise<string>;
		// compare a string value to a hashed value
		verify: (text: string, hash: string) => Promise<boolean>;

		permission: {
			isAdmin: boolean;
			isVendor: boolean;
			isCustomer: boolean;
		};
		multiLang: boolean;
	}
}

const getApp = async () => {
	const configs = await getConfigs();

	const stream = pretty({
		colorize: configs.instance.prettyPrint,
		singleLine: !configs.instance.prettyPrint,
		ignore: "hostname",
	});

	const app = fastify({
		logger: pino(
			{
				level: configs.instance.debug ? "debug" : "info",
				timestamp: true,
			},
			stream
		),
		ajv: {
			customOptions: {
				strict: "log",
				keywords: ["kind", "modifier"],
			},
		},
		pluginTimeout: 300000, // 5 minutes timeout for plugins
	}).withTypeProvider<TypeBoxTypeProvider>();

	// access configs from anywhere
	app.decorate("configs", configs);
	app.register(import("./../src/plugins/sequelize"));
	app.register(fastifyAuth);
	app.register(import("@fastify/compress"));
	app.register(import("@fastify/cors"), {
		origin: true,
		credentials: true,
	});
	app.register(import("@fastify/sensible"));

	if (configs.instance.exposeSwagger) {
		app.register(fastifySwagger, app.configs.swagger);
		app.register(helmet, (instance) => ({
			contentSecurityPolicy: {
				directives: {
					...helmet.contentSecurityPolicy.getDefaultDirectives(),
					"form-action": ["'self'"],
					"img-src": ["'self'", "data:", "validator.swagger.io"],
					"script-src": ["'self'"].concat(instance.swaggerCSP.script),
					"style-src": ["'self'", "https:"].concat(instance.swaggerCSP.style),
				},
			},
		}));
	} else {
		app.register(helmet);
	}

	// load plugins
	app.register(import("./../src/plugins/jwt"));
	app.register(import("./../src/plugins/authorize"));
	app.register(import("./../src/plugins/hash"));
	app.register(import("./../src/plugins/json-schema"));
	app.register(import("./../src/plugins/i18n"));
	app.register(import("./plugins/logging"));
	app.register(import("./../src/plugins/upload"));
	app.register(import("./../src/plugins/sendGrid"));
	app.register(import("./plugins/wallet-encryption"));
	app.register(import("./plugins/google-maps"));
	app.register(import("./plugins/sms"));
	app.register(import("./plugins/notifications"));

	// api goes here
	app.register(modules, { prefix: "v1" });

	app.get("/", (req, res) => {
		res.send({
			message: "App is running successfully!",
		});
	});

	setFastifyInstance(app);
	app.ready(async (err) => {
		if (err) throw err;
		try {
			// Database sync moved here from plugin to prevent timeout
			app.log.info("Starting database sync...");
			await app.db.sync({ alter: true, logging: false });
			app.log.info("Database sync completed successfully");

			await seedAdmin(configs);
			app.log.info("Admin seeding completed");
			await seedDemoBookingData(configs);
			app.log.info("Demo hotel seeding completed");

			app.log.info("Syncing db tables done");
		} catch (error) {
			app.log.error("Error during app initialization:", error);
			// Don't throw here to allow app to continue
		}

		if (configs.instance.exposeSwagger) {
			app.swagger();
		}
	});
	return app;
};

export { getApp };
