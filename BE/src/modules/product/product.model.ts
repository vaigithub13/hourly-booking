import { BeforeDestroy, BeforeSave, BelongsTo, BelongsToMany, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { LangObject } from "../../types/common-types";
import { AttributeEnum } from "src/types/enums";
import { Category } from "../category/category.model";
import { Admin } from "../admin/admin.model";
import { CartItem } from "../cart/cart.model";
import { Transaction } from "sequelize";
import { CustomAttributes, SKUCustomAttributes } from "../custom_attributes/custom_attributes.model";
import { OrderItem } from "../order/order-item/order-item.model";
import { destroyInstancesArray } from "src/utils/sequelize";
import { ReturnOrderItems } from "../order/return-order.model";

@Table({
	timestamps: true,
	tableName: "products",
	modelName: "Product",
	paranoid: true,
})
export class Product extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
	})
	name: LangObject;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
	})
	description: LangObject;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	mainImage: string;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
		defaultValue: [],
	})
	images: string[];

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
	})
	price: number;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	approved: boolean;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	readyToShip: boolean;

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: true,
	})
	discountedPrice: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	serial: string;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
		defaultValue: 0,
	})
	etaDays: number;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	totalStockQuantity: number;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	totalOrders: number;

	@Column({ type: DataType.JSONB, allowNull: true })
	metadata: object;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	sizeAttriputes: Record<string, any>[];

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	colorAttriputes: Record<string, any>[];

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	lengthAttriputes: Record<string, any>[];

	@ForeignKey(() => Admin)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	vendorId: number;

	@BelongsTo(() => Admin, { as: "vendor", foreignKey: "vendorId" })
	vendor: Admin;

	// @ForeignKey(() => Category)
	// @Column({
	//   type: DataType.INTEGER,
	//   allowNull: true,
	// })
	// categoryId: number;

	// @BelongsTo(() => Category)
	// category: Category;

	@BelongsToMany(() => Category, () => ProductCategory)
	categories: Category[];

	@HasMany(() => SKU, { onUpdate: "CASCADE", onDelete: "CASCADE" })
	skus: SKU[];

	@HasMany(() => ProductSupportedAttributes, { onUpdate: "CASCADE", onDelete: "CASCADE" })
	supportedCustomAttributes: ProductSupportedAttributes[];

	@BeforeSave
	static async beforeSaveHook(instance: Product) {
		const skusAmountSum = await SKU.sum("amount", {
			where: { productId: instance.id },
		});
		instance.totalStockQuantity = skusAmountSum;
	}

	@BeforeDestroy
	static async beforeDestroyHook(instance: Product) {
		await Promise.all([await SKU.destroy({ where: { productId: instance.get("id") } })]);
	}
}

@Table({
	timestamps: true,
	tableName: "sku",
	modelName: "SKU",
	paranoid: true,
})
export class SKU extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@BelongsToMany(() => CustomAttributes, {
		through: {
			model: () => SKUCustomAttributes,
			unique: false,
		},
	})
	attributes: CustomAttributes[];

	@HasMany(() => SKUCustomAttributes)
	skuCustomAttributes: SKUCustomAttributes[];

	@HasMany(() => ReturnOrderItems)
	returnOrderItems: ReturnOrderItems[];

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	amount: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	code: string;

	@ForeignKey(() => Product)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	productId: number;

	@BelongsTo(() => Product)
	product: Product;

	@BeforeDestroy
	static async beforeDestroyHook(instance: SKU, options?: { transaction: Transaction }) {
		const toDeleteCartItems = await CartItem.findAll({
			where: { skuId: instance.get("id") },
			attributes: ["id"],
		});

		const toDeleteOrderItems = await OrderItem.findAll({
			where: { skuId: instance.get("id") },
			attributes: ["id"],
		});

		await Promise.all([
			destroyInstancesArray(toDeleteCartItems as unknown as CartItem[], options?.transaction),
			destroyInstancesArray(toDeleteOrderItems as unknown as OrderItem[], options?.transaction),
		]);
	}
}

@Table({
	tableName: "products_categories",
	modelName: "ProductCategory",
})
export class ProductCategory extends Model {
	@ForeignKey(() => Product)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	productId: number;

	@BelongsTo(() => Product)
	product: Product;

	@ForeignKey(() => Category)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	categoryId: number;

	@BelongsTo(() => Category)
	category: Category;
}

@Table({
	tableName: 'products_supported_attributes',
	modelName: 'ProductSupportedAttributes',
})
export class ProductSupportedAttributes extends Model {
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
		allowNull: false,
	})
	customAttributeId: number;

	@BelongsTo(() => CustomAttributes)
	customAttribute: CustomAttributes;
}