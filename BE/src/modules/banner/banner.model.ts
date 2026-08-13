import {
  BelongsTo,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { BannerType, bannerType } from "./banner.dto";
import { LangObject } from "../../types/common-types";
import { Admin } from "../admin/admin.model";
import { Category } from "../category/category.model";
import { Product } from "../product/product.model";

@Table({
  timestamps: true,
  tableName: "banners",
  modelName: "Banner",
})
export class Banner extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rank: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  image: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "",
  })
  url: string;

  @Column({ type: DataType.STRING, defaultValue: BannerType.Admin })
  type: BannerType;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  title: LangObject;

  @Column({ type: DataType.DATE })
  from: Date;

  @Column({ type: DataType.DATE })
  to: Date;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  vendorId: number;

  @BelongsTo(() => Admin)
  vendor: Admin;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  categoryId: number;

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  productId: number;

  @BelongsTo(() => Product)
  product: Product;
}
