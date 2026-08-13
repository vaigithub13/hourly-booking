import {
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  Column,
  DataType,
} from "sequelize-typescript";
import { Order } from "../order/order.model";

@Table({
  createdAt: true,
  updatedAt: true,
  tableName: "orders_trackings",
  modelName: "OrderTracking",
  paranoid: true,
})
export class OrderTracking extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  status: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;
}
