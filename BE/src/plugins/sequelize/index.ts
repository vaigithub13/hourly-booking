import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Sequelize } from "sequelize-typescript";
import cls from "cls-hooked";
import { Configuration } from "./../../modules/configuration/configuration.model";
import { Admin } from "../../modules/admin/admin.model";
import { User } from "../../modules/user/user.model";
import { Banner } from "../../modules/banner/banner.model";
import { Category } from "./../../modules/category/category.model";
import { Product, ProductCategory, ProductSupportedAttributes, SKU } from "src/modules/product/product.model";
import { Vendor } from "src/modules/vendor/vendor.model";
import { Location } from "src/modules/locations/locations.model";
import { Cart, CartItem } from "src/modules/cart/cart.model";
import { Wallet } from "src/modules/wallet/wallet.model";
import { CustomAttributes, SKUCustomAttributes } from "src/modules/custom_attributes/custom_attributes.model";
import { CancelOrderRequest, Order } from "src/modules/order/order.model";
import { OrderItem } from "src/modules/order/order-item/order-item.model";
import { Accounting } from "src/modules/accounting/accounting.model";
import { UserAddress } from "src/modules/user-address/user-address.model";
import { ProductLength } from "src/modules/product-length/product-length.model";
import { SizeGuide } from "src/modules/size-guide/size-guide.model";
import { OrderTracking } from "src/modules/order-tracking/order-tracking.model";
import { Notifications } from "../../modules/notification/notification.model";
import { Payments } from "src/modules/payment/payment.model";
import { FAQ } from "src/modules/faqs/faqs.model";
import { ReturnOrder, ReturnOrderItems } from "src/modules/order/return-order.model";
import { TransactionModel } from "src/modules/transaction/transaction.model";
import { Tips } from "src/modules/tips/tips.model";
import { Log } from "../../modules/logs/logs.model";
import { Hotel } from "src/modules/hotel/hotel.model";
import { RoomType, Room } from "src/modules/room/room.model";
import { Booking } from "src/modules/booking/booking.model";
import { BookingPayment } from "src/modules/razorpay/razorpay.model";

const sequelizePlugin = async (instance: FastifyInstance) => {
	const namespace = cls.createNamespace("transaction-cls");
	Sequelize.useCLS(namespace);
	(Sequelize as any).DataTypes.postgres.DECIMAL.parse = parseFloat;
	const env = instance.configs.instance.env;
	const isDev = env === "development";
	const databaseUrl = instance.configs.db.url;

	console.log("========== env:", env);
	console.log("========== isDev:", isDev);

	const dialectOptions =
		databaseUrl || (instance.configs.db.host !== "localhost" && instance.configs.db.host !== "127.0.0.1")
			? {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
			  }
			: {};

	const models = [
		Hotel,
		RoomType,
		Room,
		Booking,
		BookingPayment,
		Admin,
		User,
		Banner,
		Category,
		Configuration,
		Product,
		Location,
		SKU,
		Cart,
		CartItem,
		Wallet,
		CustomAttributes,
		SKUCustomAttributes,
		Order,
		OrderItem,
		Accounting,
		CancelOrderRequest,
		ProductCategory,
		ReturnOrder,
		ReturnOrderItems,
		UserAddress,
		ProductLength,
		SizeGuide,
		OrderTracking,
		Notifications,
		Payments,
		FAQ,
		TransactionModel,
		Tips,
		ProductSupportedAttributes,
		Log,
	];

	const sequelize = databaseUrl
		? new Sequelize(databaseUrl, {
				dialect: "postgres",
				logging: (msg) => instance.log.debug(msg),
				dialectOptions,
				pool: { min: 0, max: 10, acquire: 60000, idle: 10000 },
				models,
		  })
		: new Sequelize({
				dialect: "postgres",
				database: !instance.configs.instance.isTest ? instance.configs.db.name : instance.configs.db.testName,
				username: instance.configs.db.username,
				password: instance.configs.db.password,
				host: instance.configs.db.host || "localhost",
				port: instance.configs.instance.isTest ? instance.configs.db.testPort : instance.configs.db.port,
				logging: (msg) => instance.log.debug(msg),
				dialectOptions,
				pool: { min: 0, max: 10, acquire: 60000, idle: 10000 },
				models,
		  });

	instance.decorate("db", sequelize);
	instance.addHook("onClose", async () => sequelize.close());
	sequelize.addHook("beforeCount", (options) => {
		if (options.include) {
			const includeArray = options.include as any[];
			if (includeArray.length) options.distinct = true;
		}
	});
	try {
		await sequelize.authenticate();
		// if (instance.configs.db.host === "localhost")
		await sequelize.sync({ alter: true, logging: false });
		instance.log.info("Connection to database has been established successfully.");
	} catch (error) {
		instance.log.error("Unable to connect to the database.");
		throw error;
	}
};

export default fp(sequelizePlugin, {
	name: "sequelize-plugin",
});
