import { LangObject } from "../../types/common-types";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Product } from "../product/product.model";

@Table({
	tableName: "bloggers",
	modelName: "Blogger",
})
export class Blogger extends Model {
	@Column({
		type: DataType.STRING,
	})
	name: string;

	@Column({
		type: DataType.STRING,
	})
	logo: string;

	@Column({ type: DataType.STRING })
	email: string;
}

@Table({
	tableName: "blogger_product",
	modelName: "BloggerProducts",
})
export class BloggerProducts extends Model {
	@ForeignKey(() => Blogger)
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	bloggerId: number;

	@BelongsTo(() => Blogger)
	blogger: Blogger;

	@Column({ type: DataType.INTEGER, allowNull: false })
	productId: number;

	@BelongsTo(() => Product)
	product: Product;
}
