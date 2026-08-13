import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AfterCreate, AfterDestroy } from "sequelize-typescript";
import { Order } from "../order.model";
import { User } from "src/modules/user/user.model";
import { Product, SKU } from "src/modules/product/product.model";
import { Transaction } from "sequelize";
import { JObject } from "src/types/common-types";
import { CustomAttributes } from "src/modules/custom_attributes/custom_attributes.model";

@Table({
	createdAt: true,
	modelName: "OrderItem",
	tableName: "orders_items",
	paranoid: true,
})
export class OrderItem extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	totalPrice: number;

	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	totalDiscount: number;

	@Column({ type: DataType.INTEGER, allowNull: false })
	quantity: number;

	@Column({ type: DataType.JSONB, defaultValue: null })
	skuData: JObject;

	@Column({ type: DataType.JSONB, defaultValue: null })
	productData: JObject;

	@ForeignKey(() => Order)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	orderId: number;

	@BelongsTo(() => Order)
	order: Order;

	@ForeignKey(() => User)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@ForeignKey(() => SKU)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	skuId: number;

	@BelongsTo(() => SKU)
	sku: SKU;

	@ForeignKey(() => Product)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	productId: number;

	@BelongsTo(() => Product)
	product: Product;

	@ForeignKey(() => CustomAttributes)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	colorId: number;

	@BelongsTo(() => CustomAttributes, {
		as: "color",
		foreignKey: "colorId",
		constraints: false,
		scope: { type: "color" },
	})
	color: CustomAttributes;

	@ForeignKey(() => CustomAttributes)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	sizeId: number;

	@BelongsTo(() => CustomAttributes, {
		as: "size",
		foreignKey: "sizeId",
		constraints: false,
		scope: { type: "size" },
	})
	size: CustomAttributes;

	@ForeignKey(() => CustomAttributes)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	lengthId: number;

	@BelongsTo(() => CustomAttributes, {
		as: "length",
		foreignKey: "lengthId",
		constraints: false,
		scope: { type: "length" },
	})
	length: CustomAttributes;

	@AfterCreate
	static async afterCreateHook(instance: OrderItem, options: { transaction?: Transaction }) {
		const order = await Order.findByPk(instance.get("orderId"), {
			transaction: options.transaction,
		});
		const queries: Promise<any>[] = [];
		if (order) {
			queries.push(
				order.increment(["subTotal", "grossTotal", "finalPrice"], {
					by: instance.get("totalPrice"),
					transaction: options.transaction,
				}),
				order.increment("totalDiscount", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				}),
				order.decrement("finalPrice", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				})
			);
		}
		await Promise.all(queries);
	}

	@AfterDestroy
	static async afterDestroyHook(instance: OrderItem, options: { transaction?: Transaction }) {
		const order = await Order.findByPk(instance.get("orderId"), {
			transaction: options.transaction,
		});
		const queries: Promise<any>[] = [];
		if (order) {
			queries.push(
				order.decrement(["subTotal", "grossTotal", "finalPrice"], {
					by: instance.get("totalPrice"),
					transaction: options.transaction,
				}),
				order.decrement("totalDiscount", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				}),
				order.increment("finalPrice", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				})
			);
		}
		await Promise.all(queries);
	}
}
