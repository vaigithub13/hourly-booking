import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ReturnOrderRequestStatusEnum, ReturnOrderStatusData } from "./return-order.enum";
import { JObject } from "src/types/common-types";

import { User } from "../user/user.model";
import { Admin } from "../admin/admin.model";
import { UserAddress } from "../user-address/user-address.model";
import { Order } from "./order.model";
import { Product, SKU } from "../product/product.model";
import { RefundTargetEnum } from "./cancel-order.dto";


@Table({
	paranoid: true,
	tableName: "return_orders",
	modelName: "ReturnOrder",
})
export class ReturnOrder extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@Column({
		type: DataType.STRING,
		defaultValue: ReturnOrderRequestStatusEnum.Pending,
	})
	status: ReturnOrderRequestStatusEnum;

	@Column({ type: DataType.INTEGER })
	totalPrice: number;

	@Column({ type: DataType.STRING, defaultValue: RefundTargetEnum.PENDING })
	refundTarget: RefundTargetEnum;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	amountReturnedToWallet: number;

	@Column({ type: DataType.STRING, allowNull: true })
	returnReason: string;

	@Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
	images: string[];

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	deliveryPaidByVendor: boolean;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	deliveryCost: number;

	@Column({ type: DataType.STRING, allowNull: true })
	vendorReason: string;

	@Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
	vendorImages: string[];

	@Column({ type: DataType.STRING, allowNull: true })
	deliveryId: string;

	@Column({ type: DataType.STRING, allowNull: true })
	taskId: string;

	@Column({
		type: DataType.ARRAY(DataType.JSONB),
		defaultValue: [{ ...ReturnOrderStatusData[0], loggedAt: new Date() }],
	})
	tracking: { statusId: number; status: string; loggedAt: Date }[];

	@ForeignKey(() => User)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@ForeignKey(() => Admin)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	vendorId: number;

	@BelongsTo(() => Admin)
	vendor: Admin;

	@ForeignKey(() => UserAddress)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	userAddressId: number;

	@BelongsTo(() => UserAddress)
	userAddress: UserAddress;

	@ForeignKey(() => Order)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	orderId: number;

	@BelongsTo(() => Order)
	order: Order;

	@HasMany(() => ReturnOrderItems)
	items: ReturnOrderItems[];
}

@Table({
	paranoid: true,
	tableName: "return_order_items",
	modelName: "ReturnOrderItem",
})
export class ReturnOrderItems extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@ForeignKey(() => ReturnOrder)
	@Column({ type: DataType.INTEGER })
	returnOrderId: number;

	@BelongsTo(() => ReturnOrder)
	returnOrder: ReturnOrder;

	@ForeignKey(() => SKU)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	skuId: number;

	@BelongsTo(() => SKU)
	sku: SKU;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	skuData: JObject;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	productData: JObject;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	length: JObject;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	color: JObject;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	size: JObject;

	@ForeignKey(() => Product)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	productId: number;

	@BelongsTo(() => Product)
	product: Product;

	@Column({ type: DataType.INTEGER })
	quantity: number;

	@Column({ type: DataType.INTEGER })
	price: number;

	@Column({ type: DataType.INTEGER })
	totalPrice: number;
}
