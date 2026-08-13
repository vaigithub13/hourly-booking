import {
  BeforeDestroy,
  BelongsToMany,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { LangObject } from "../../types/common-types";
import { Product, SKU } from "../product/product.model";
import { AttributeEnum } from "src/types/enums";

@Table({
  timestamps: true,
  tableName: "custom_attributes",
  modelName: "CustomAttributes",
})
export class CustomAttributes extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: AttributeEnum;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  name: LangObject;

  @BelongsToMany(() => SKU, {
    through: {
      model: () => SKUCustomAttributes,
      unique: false,
    }
  })
  skus: SKU[]

  @HasMany(() => SKUCustomAttributes)
  skuCustomAttributes: SKUCustomAttributes[]

}


@Table({
  timestamps: true,
  tableName: "sku_custom_attributes",
  modelName: "SKUCustomAttributes",
})
export class SKUCustomAttributes extends Model {

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => SKU)
  @Column({
    type: DataType.INTEGER,
  })
  skuId: number;

  @ForeignKey(() => CustomAttributes)
  @Column({
    type: DataType.INTEGER,
  })
  customAttributesId: number;

}