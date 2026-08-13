import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  AllowNull,
} from "sequelize-typescript";
import { User } from "../user/user.model";
import { LangObject } from "src/types/common-types";

@Table({
  paranoid: true,
  tableName: "notifications",
  modelName: "Notifications",
})
export class Notifications extends Model {
  @Column({
    type: DataType.STRING,
  })
  type?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId?: number;

  @BelongsTo(() => User, "userId")
  user: User;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isPublic!: boolean;

  @Column({
    type: DataType.JSONB,
  })
  content: LangObject;

  @Column({
    type: DataType.JSONB,
  })
  title: LangObject;

  @Column({
    type: DataType.JSONB,
  })
  data?: object;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  seen!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSent!: boolean;
}
