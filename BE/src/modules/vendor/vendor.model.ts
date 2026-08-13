import { User } from "../../modules/user/user.model";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Product } from "../product/product.model";

@Table({
  tableName: "vendors",
  modelName: "Vendor",
})
export class Vendor extends Model {
  @Column({ type: DataType.STRING })
  address: string;

  @Column({ type: DataType.STRING })
  certificate: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  designerWallet: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User, "userId")
  user: User;

  @HasMany(() => Product, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  products: Product[];
}
