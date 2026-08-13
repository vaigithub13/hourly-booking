import { LangObject } from "./../../types/common-types";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "faqs",
  modelName: "FAQ",
})
export class FAQ extends Model {
  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  title: LangObject;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  question: LangObject;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  answer: LangObject;
}
