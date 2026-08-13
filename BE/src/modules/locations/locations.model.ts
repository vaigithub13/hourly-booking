import { LangObject } from "../../types/common-types";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "locations",
  modelName: "Location",
})
export class Location extends Model {
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
  zone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "0",
  })
  lat: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "0",
  })
  lng: string;

  // @Column({
  //   type: DataType.JSONB,
  //   allowNull: false,
  // })
  // area: LangObject;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;
}
