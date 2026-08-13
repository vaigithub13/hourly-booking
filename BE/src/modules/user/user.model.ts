import { destroyInstancesArray } from "src/utils/sequelize";
import { Cart } from "../cart/cart.model";
import { OrderItem } from "../order/order-item/order-item.model";
import { Order } from "../order/order.model";
import { Wallet } from "../wallet/wallet.model";
import { IUserMetaData } from "./../../types/auth";
import { BeforeDestroy, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasOne, Model, Table } from "sequelize-typescript";
import { Transaction } from "sequelize";

@Table({
	tableName: "users",
	modelName: "User",
	paranoid: true,
})
export class User extends Model {
	@Column({
		type: DataType.STRING,
	})
	firstName?: string;
	@Column({
		type: DataType.STRING,
	})
	lastName?: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	phoneNumber: string;

	@Column({
		type: DataType.STRING,
	})
	email?: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	verified: boolean;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	password: string;

	@Column({
		type: DataType.TEXT,
	})
	profilePicture?: string;

	@Column({ type: DataType.STRING })
	gender?: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	blocked: boolean;

	@Column({
		type: DataType.STRING,
		defaultValue: "en",
	})
	preferredLang: string;

	@Column({
		type: DataType.STRING,
	})
	deviceId?: string;

	@Column({
		type: DataType.JSONB,
	})
	verifyOtpMetaData?: IUserMetaData;

	@Column({ type: DataType.STRING })
	role: string;

	@Column({
		type: DataType.JSONB,
	})
	forgetPasswordOtpMetaData: IUserMetaData;

	@BeforeDestroy
	static async beforeDestroyHook(instance: User, options?: { transaction: Transaction }) {
		const toDeleteCarts = await Cart.findAll({
			where: { userId: instance.get("id") },
			attributes: ["id"],
		});

		const toDeleteOrders = await Order.findAll({
			where: { userId: instance.get("id") },
			attributes: ["id"],
		});

		const toDeleteOrderItems = await OrderItem.findAll({
			where: { userId: instance.get("id") },
			attributes: ["id"],
		});

		const toDeleteWallets = await Wallet.findAll({
			where: { userId: instance.get("id") },
			attributes: ["id"],
		});

		await Promise.all([
			destroyInstancesArray(toDeleteCarts as unknown as Cart[], options?.transaction),
			destroyInstancesArray(toDeleteOrders as unknown as Order[], options?.transaction),
			destroyInstancesArray(toDeleteOrderItems as unknown as OrderItem[], options?.transaction),
			destroyInstancesArray(toDeleteWallets as unknown as Wallet[], options?.transaction),
		]);
	}
}
