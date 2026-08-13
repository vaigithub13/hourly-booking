import { LangObject } from "../../types/common-types";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "products_lengths",
  modelName: "ProductLength",
})
export class ProductLength extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  length: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  available: boolean;
}
