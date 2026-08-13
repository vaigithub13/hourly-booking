import {
  BelongsTo,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Column } from "sequelize-typescript";
import { AccountingStatus } from "src/types/enums";
import { Admin } from "../admin/admin.model";
import { Order } from "../order/order.model";
import { ReturnOrder } from "../order/return-order.model";

@Table({
  timestamps: true,
  tableName: "accountings",
  modelName: "Accounting",
})
export class Accounting extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isRefunded: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: AccountingStatus;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  vendorId: number;

  @BelongsTo(() => Admin)
  vendor: Admin;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @ForeignKey(() => ReturnOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  returnOrderId: number;

  @BelongsTo(() => ReturnOrder)
  returnOrder: ReturnOrder;
}
