import {
  BeforeDestroy,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model";

@Table({
  modelName: "UserAddress",
  tableName: "user_addresses",
  createdAt: true,
  updatedAt: true,
})
export class UserAddress extends Model {
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
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  zone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  street: string;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  buildingInfo: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  insideDoha: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isDefault: boolean;

  @Column({
    type: DataType.STRING,
  })
  unit: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lat: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lng: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @BeforeDestroy
  static async beforeDestroyHook(instance: UserAddress) {}
}
