import {
	Model,
	DataType,
	Column,
	ForeignKey,
	BelongsTo,
	Table,
	HasMany,
	BeforeDestroy,
	AfterCreate,
	AfterDestroy,
	AfterUpdate,
	BeforeSave,
	BeforeFind,
	AfterFind,
} from "sequelize-typescript";
import { User } from "../user/user.model";
import { Product, SKU } from "../product/product.model";
import { Transaction } from "sequelize";
import { UserAddress } from "../user-address/user-address.model";
import { destroyInstancesArray } from "src/utils/sequelize";
import { cartIncludes } from "./utils/fetchables";
import { CustomAttributes } from "../custom_attributes/custom_attributes.model";
@Table({
	createdAt: true,
	modelName: "Cart",
	tableName: "carts",
})
export class Cart extends Model {
	// The final price after adding delivery charge and subtract the total discount
	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	finalPrice: number;

	// The gross total is subtotal + delivery charge
	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	grossTotal: number;

	// The subtotal is the sum of products prices before discounts
	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	subTotal: number;

	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	totalDiscount: number;

	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	deliveryCost: number;

	@ForeignKey(() => User)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@ForeignKey(() => UserAddress)
	@Column({
		type: DataType.INTEGER,
	})
	userAddressId: number;

	@BelongsTo(() => UserAddress)
	userAddress: UserAddress;

	@HasMany(() => CartItem)
	items: CartItem[];

	@BeforeDestroy
	static async beforeDestroyHook(instance: Cart, options?: { transaction: Transaction }) {
		const toDeleteCartItems = await CartItem.findAll({
			where: { cartId: instance.get("id") },
			attributes: ["id"],
		});

		await Promise.all([destroyInstancesArray(toDeleteCartItems as unknown as CartItem[], options?.transaction)]);
	}

	@BeforeSave
	static async beforeSaveHook(instance: Cart, options: { transaction?: Transaction }) {
		instance.grossTotal = instance.subTotal + instance.deliveryCost;
		instance.finalPrice = instance.grossTotal - instance.totalDiscount;
		const queries: Promise<any>[] = [];
		await Promise.all(queries);
	}

	@BeforeFind
	static async beforeFindHook(instance: Cart, options: { transaction?: Transaction }) {
		if (!instance) return;
		instance.grossTotal = instance.subTotal + instance.deliveryCost;
		instance.finalPrice = instance.grossTotal - instance.totalDiscount;
		const queries: Promise<any>[] = [];
		await Promise.all(queries);
	}
}

@Table({
	createdAt: true,
	modelName: "CartItem",
	tableName: "carts_items",
})
export class CartItem extends Model {
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

	@ForeignKey(() => Cart)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	cartId: number;

	@BelongsTo(() => Cart)
	cart: Cart;

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
	static async afterCreateHook(instance: CartItem, options: { transaction?: Transaction }) {
		const cart = await Cart.findByPk(instance.get("cartId"), {
			transaction: options.transaction,
		});

		const queries: Promise<any>[] = [];
		if (cart) {
			queries.push(
				cart.increment(["subTotal", "grossTotal", "finalPrice"], {
					by: instance.get("totalPrice"),
					transaction: options.transaction,
				}),
				cart.increment("totalDiscount", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				}),
				cart.decrement("finalPrice", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				})
			);
		}
		await Promise.all(queries);
	}

	@AfterDestroy
	static async afterDestroyHook(instance: CartItem, options: { transaction?: Transaction }) {
		const cart = await Cart.findByPk(instance.get("cartId"), {
			transaction: options.transaction,
		});
		const queries: Promise<any>[] = [];
		if (cart) {
			queries.push(
				cart.decrement(["subTotal", "grossTotal", "finalPrice"], {
					by: instance.get("totalPrice"),
					transaction: options.transaction,
				}),
				cart.decrement("totalDiscount", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				}),
				cart.increment("finalPrice", {
					by: instance.get("totalDiscount"),
					transaction: options.transaction,
				})
			);
		}
		await Promise.all(queries);
	}

	@AfterUpdate
	static async afterUpdateHook(instance: CartItem, options: { transaction?: Transaction }) {
		const cart = await Cart.findByPk(instance.get("cartId"), {
			transaction: options.transaction,
			include: [CartItem],
		});

		const queries: Promise<any>[] = [];
		if (cart) {
			const totalCartItemsPrice = cart.get("items").reduce((sum: number, item: CartItem) => sum + item.get("totalPrice"), 0);

			const totalCartItemsDiscount = cart.get("items").reduce((sum: number, item: CartItem) => sum + item.get("totalDiscount"), 0);

			queries.push(
				cart.update(
					{
						subTotal: totalCartItemsPrice,
						totalDiscount: totalCartItemsDiscount,
					},
					{ transaction: options.transaction }
				)
			);
		}
		await Promise.all(queries);
	}
}
