import { BeforeDestroy, BelongsTo, BelongsToMany, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { LangObject } from "../../types/common-types";
import { Product, SKU } from "../product/product.model";
import { AttributeEnum } from "src/types/enums";
import { Admin } from "../admin/admin.model";
import { Order } from "../order/order.model";

@Table({
	paranoid: true,
	tableName: "transactions",
	modelName: "Transaction",
})
export class TransactionModel extends Model {
	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0,
	})
	amount: number;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
	})
	description: {
		en: string;
		ar: string;
	};

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	date: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	type: 0 | 1;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		defaultValue: "",
	})
	referenceId: string;

	@Column({
		type: DataType.STRING,
	})
	attachment: string;

	@ForeignKey(() => Admin)
	@Column({
		type: DataType.INTEGER,
	})
	vendorId: number;

	@BelongsTo(() => Admin)
	vendor: Admin;

	@ForeignKey(() => Order)
	@Column({
		type: DataType.INTEGER,
	})
	orderId: number;

	@BelongsTo(() => Order)
	order: Order;
}
