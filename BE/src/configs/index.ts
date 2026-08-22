import { Type } from "@sinclair/typebox";
import envSchema from "env-schema";

const getConfigs = async () => {
	const env = envSchema({
		dotenv: true,
		schema: Type.Object({
			//* General
			NODE_ENV: Type.String({ default: "production" }),
			DEBUG: Type.String({ default: "false" }),
			API_HOST: Type.String({ default: "http://localhost:8080" }),
			FE_HOST: Type.String({ default: "" }),
			API_PORT: Type.String({ default: "8080" }),
			ENABLE_SEED: Type.String({ default: "true" }),
			ENABLE_DEMO_SEED: Type.String({ default: "true" }),
			ENABLE_SWAGGER: Type.String({ default: "true" }),
			ENABLE_OTP_BYPASS: Type.String({ default: "true" }),

			//* Admin
			ADMIN_EMAIL: Type.String(),
			ADMIN_PASSWORD: Type.String(),
			ENCRYPTION_KEY: Type.String({ minLength: 32, maxLength: 32 }),

			//* AWS (optional on free demo deploys)
			AWS_S3_KEY: Type.String({ default: "" }),
			AWS_S3_SECRET: Type.String({ default: "" }),
			AWS_S3_BUCKET: Type.String({ default: "" }),
			AWS_S3_BASE_URL: Type.String({ default: "" }),
			LAMBDA_IMAGE_COMPRESSION_PERCENTAGE: Type.Number({ default: 50 }),
			LAMBDA_IMAGE_COMPRESSION_FUNCTION_NAME: Type.String({ default: "" }),

			//* DB — use DATABASE_URL (Neon/Render) OR the split fields
			DATABASE_URL: Type.String({ default: "" }),
			DB_HOST: Type.String({ default: "localhost" }),
			DB_PORT: Type.String({ default: "5432" }),
			DB_NAME: Type.String({ default: "hotel_booking" }),
			DB_USERNAME: Type.String({ default: "postgres" }),
			DB_PASSWORD: Type.String({ default: "postgres" }),

			//* JWT
			JWT_EXPIRE: Type.String({ default: "7d" }),
			REFRESH_TOKEN_EXPIRE: Type.String({ default: "30d" }),
			JWT_SECRET: Type.String(),

			//* OneSignal
			ONESIGNAL_APP_ID: Type.String({ default: "" }),
			ONESIGNAL_APP_REST_API_KEY: Type.String({ default: "" }),

			//* Twilio
			TWILIO_SID: Type.String({ default: "" }),
			TWILIO_AUTH: Type.String({ default: "" }),

			//* Payment
			PAYMENT_SECRET_KEY: Type.String({ default: "" }),
			PAYMENT_FIXED_FEE: Type.Number({ default: 0 }),
			PAYMENT_PERCENT_FEE: Type.Number({ default: 0 }),

			//* Sendbird
			SENDBIRD_APP_ID: Type.String({ default: "" }),
			SENDBIRD_API_TOKEN: Type.String({ default: "" }),
			OTP_WAIT_PER_MINUTES: Type.Number({ default: 1 }),

			//* Sendgrid
			SENDGRID_API_KEY: Type.String({ default: "" }),
			SENDGRID_SENDER: Type.String({ default: "noreply@example.com" }),
			SENDGRID_ORDER_DETAIL_TEMPLATE_ID: Type.String({ default: "" }),

			//* SMSala
			SMSALA_API_KEY: Type.String({ default: "" }),
			SMSALA_SOURCE_ADDRESS: Type.String({ default: "" }),

			//* Google maps
			GOOGLE_MAPS_API_KEY: Type.String({ default: "" }),

			//* SkipCash
			SKIPCASH_SECRET_KEY: Type.String({ default: "" }),
			SKIPCASH_KEY_ID: Type.String({ default: "" }),
			SKIPCASH_CLIENT_ID: Type.String({ default: "" }),
			SKIPCASH_WEBHOOK_KEY: Type.String({ default: "" }),
			SKIPCASH_BASE_URL: Type.String({ default: "" }),
		}),
	});

	const isProduction = /^\s*production\s*$/i.test(`${env["NODE_ENV"]}`);
	const isDebug = /^\s*true\s*$/i.test(`${env["DEBUG"]}`);
	const isTest = /^\s*test\s*$/i.test(`${env["NODE_ENV"]}`);
	const prettyPrint = /^\s*development\s*$/i.test(`${env["NODE_ENV"]}`);
	const exposeSwagger = !isProduction || /^\s*true\s*$/i.test(`${env["ENABLE_SWAGGER"]}`);

	return {
		instance: {
			host: `${env.API_HOST}`,
			feHost: `${env.FE_HOST}`,
			port: process.env.PORT ? +`${process.env.PORT}` : +`${env["API_PORT"]}`,
			debug: isDebug,
			prettyPrint,
			isProduction,
			isTest,
			env: env.NODE_ENV,
			exposeSwagger,
		},
		admin: {
			email: `${env["ADMIN_EMAIL"]}`,
			password: `${env["ADMIN_PASSWORD"]}`,
		},
		s3: {
			baseUrl: `${env["AWS_S3_BASE_URL"]}`,
			bucketName: `${env["AWS_S3_BUCKET"]}`,
			key: `${env["AWS_S3_KEY"]}`,
			secret: `${env["AWS_S3_SECRET"]}`,
		},
		db: {
			url: `${env["DATABASE_URL"]}`,
			host: `${env["DB_HOST"]}`,
			port: +`${env["DB_PORT"]}`,
			name: `${env["DB_NAME"]}`,
			testName: `${env["TEST_DB_NAME"]}`,
			testPort: +`${env["TEST_DB_PORT"]}`,
			password: `${env["DB_PASSWORD"]}`,
			username: `${env["DB_USERNAME"]}`,
			seed: /^\s*true\s*$/i.test(`${env["ENABLE_SEED"]}`),
			demoSeed: /^\s*true\s*$/i.test(`${env["ENABLE_DEMO_SEED"]}`),
		},
		jwt: {
			expire: `${env["JWT_EXPIRE"]}`,
			secret: `${env["JWT_SECRET"]}`,
			refreshTokenExpire: `${env["REFRESH_TOKEN_EXPIRE"]}`,
		},
		otp: {
			validUntil: +`${env["OTP_WAIT_PER_MINUTES"]}`,
		},
		oneSignal: {
			apiKey: `${env["ONESIGNAL_APP_REST_API_KEY"]}`,
			appId: `${env["ONESIGNAL_APP_ID"]}`,
		},
		sendGrid: {
			apiKey: `${env["SENDGRID_API_KEY"]}`,
			sender: `${env["SENDGRID_SENDER"]}`,
			orderDetailsTemplateId: `${env["SENDGRID_ORDER_DETAIL_TEMPLATE_ID"]}`,
		},
		sendbird: {
			appId: `${env["SENDBIRD_APP_ID"]}`,
			apiToken: `${env["SENDBIRD_API_TOKEN"]}`,
		},
		twilio: {
			sid: `${env["TWILIO_SID"]}`,
			auth: `${env["TWILIO_AUTH"]}`,
			serviceSidSMS: `${env["TWILIO_SMS_SERVICE_SID"]}`,
		},
		lambda: {
			compressionPercentage: `${env["LAMBDA_IMAGE_COMPRESSION_PERCENTAGE"]}`,
			compressionFunctionName: `${env["LAMBDA_IMAGE_COMPRESSION_FUNCTION_NAME"]}`,
		},
		smsala: {
			apiKey: `${env["SMSALA_API_KEY"]}`,
			sourceAddress: `${env["SMSALA_SOURCE_ADDRESS"]}`,
		},
		payment: {
			balanceEncryptionKey: `${env["ENCRYPTION_KEY"]}`,
		},
		googleMaps: {
			apiKey: `${env["GOOGLE_MAPS_API_KEY"]}`,
		},
		skipCash: {
			secretKey: `${env["SKIPCASH_SECRET_KEY"]}`,
			keyId: `${env["SKIPCASH_KEY_ID"]}`,
			clientId: `${env["SKIPCASH_CLIENT_ID"]}`,
			webhookKey: `${env["SKIPCASH_WEBHOOK_KEY"]}`,
			baseUrl: `${env["SKIPCASH_BASE_URL"]}`,
		},
		swagger: {
			routePrefix: "/docs",
			openapi: {
				info: {
					title: "Api service for APP",
					description: "Description",
					version: "",
				},

				externalDocs: {
					url: "https://swagger.io/specification/",
					description: "Find more info here",
				},
				servers: [
					{
						url: `${env["API_HOST"]}/v1`,
					},
				],
				components: {
					securitySchemes: {
						userToken: {
							type: "apiKey" as const,
							name: "Authorization",
							in: "header",
						},
						adminToken: {
							type: "apiKey" as const,
							name: "Authorization",
							in: "header",
						},
						// add more types of tokens if needed
					},
				},
			},
			hideUntagged: false,
			exposeRoute: exposeSwagger,
		},
		delivery: {
			key: `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxMSIsImp0aSI6IjA4ZWM5OWM0Mjk0YTNmZWJlYTEwMDdlMTI4ZmNjYzJmZWI4ZDBmMDYyNDQxODUwNGFhYjkzOGViYTE3NDEzMmQ2ZDYyZDU5YTVkMGE4ZDMzIiwiaWF0IjoxNzUyNzU0NDI2LjQ4MzA5NSwibmJmIjoxNzUyNzU0NDI2LjQ4MzA5OCwiZXhwIjoxNzg0MjkwNDI2LjQ3ODk3Nywic3ViIjoiMTA4ODAiLCJzY29wZXMiOltdfQ.kCxkRD6oBdhduRNpFDqFx2hFHNw_L7WRLy6QNeZ2q5K4prp8uzkB3L00fjGwzDmFjnWNrJp5KoF4h2ODnHFaVNsuqJXT3ggfUeEl3IuakWrD9-GI10A2z6QTXea49kCzqalMKtPMYNQEVTkiZKRehnjVdV9N3Jq7W0ArmZOIu-I6ZzXVhS6RfrP394F-nNQkAWCIfr95-P97XEgVyMu6ZqOJuQ3WDWphM6D5_qiy71dzhWe1faaQZkEuE4lRMOaSXeQQ_v-JZ5b7Sod2Xuy4siWYELu_kXv0b3w8SpqhVLTUfo7dwVV6Zg5gzmTmRcsttvwJe91gqCOC9JukfVqboRiRbOtXvZ0p3uyxJUURYEchR4qcElN1oOeZJFX5RRk89Q30EO0kpbE_ZAKNVnfRH4EAevbz3Z7gfUMn86e9NHXEACyMh87C5aggtwdk8bQXM9Z4Xmp6GFK3eaUxFQ9Jhq6jRMNoh1hK0het95VjDwQzSu9K9A15oXE_07GNhX4sUx8_8a407giW2OpyH2AJhyAfyD8HxXTM4xncQGa3KH0ZV1UEzBJVZfg6X7uYZPD3ZJUm5lXsWy-Ilj6ESg07M3wuHJIDmo7sWENlXTvVHquxaYm91rUfYEnYL3_d3v2zDPvMP7EQF7Pd1oilSO8bBRHTVhrKhQ038Ow_7Slu_RE`,
		},
	};
};

export { getConfigs };
