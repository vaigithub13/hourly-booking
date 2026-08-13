import {
  BeforeDestroy,
  BelongsToMany,
  DataType,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { LangObject } from "../../types/common-types";
import { Product, ProductCategory } from "../product/product.model";
import { Transaction } from "sequelize";

@Table({
  timestamps: true,
  tableName: "categories",
  modelName: "Category",
})
export class Category extends Model {
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
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isRequiredLength: boolean;

  @BelongsToMany(() => Product, () => ProductCategory)
  categories: Category[];

  @BeforeDestroy
  static async beforeDestroyHook(
    instance: Category,
    options: { transaction: Transaction }
  ) {
    await Product.update(
      { categoryId: null },
      {
        where: { categoryId: instance.get("id") },
        transaction: options.transaction,
      }
    );
  }
}
