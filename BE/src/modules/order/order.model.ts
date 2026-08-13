import {
  Model,
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  BeforeDestroy,
  BeforeCreate,
  BeforeSave,
  AfterFind,
  HasOne,
  BeforeUpdate,
} from "sequelize-typescript";
import { User } from "../user/user.model";
import { Admin } from "../admin/admin.model";
import { OrderStatusEnum, PaymentStatusEnum } from "./order.dto";
import { Transaction } from "sequelize";
import { Location } from "../locations/locations.model";
import { OrderItem } from "./order-item/order-item.model";
import {
  CancelOrderRequestStatusEnum,
  RefundTargetEnum,
} from "./cancel-order.dto";
import { UserAddress } from "../user-address/user-address.model";
import { destroyInstancesArray } from "src/utils/sequelize";
import { ReturnOrder } from "./return-order.model";
import { Accounting } from "../accounting/accounting.model";

@Table({
  paranoid: true,
  tableName: "orders",
  modelName: "Order",
})
export class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  // the total of the items with the discount - returned price
  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  finalPrice: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  returnedPrice: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  finalPriceWithoutReturned: number;

  // the total of the items without the discount
  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  subTotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  totalDiscount: number;

  // the total of the items without the discount + delivery cost
  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  grossTotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  deliveryCost: number;

  @Column({ type: DataType.STRING, defaultValue: OrderStatusEnum.PLACED })
  status: string;

  @Column({ type: DataType.STRING })
  paymentMethod: string;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  walletPaidAmount: number;

  @Column({ type: DataType.STRING, defaultValue: PaymentStatusEnum.PENDING })
  paymentStatus: PaymentStatusEnum;

  @Column({ type: DataType.INTEGER })
  estimatedDeliveryDays: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  canBeCanceled: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  canBeReturned: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRated: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rate: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  isPaid: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  deliveryId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  taskId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  note: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vendorId: number;

  @BelongsTo(() => Admin)
  vendor: Admin;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  locationId: number;

  @BelongsTo(() => Location)
  location: Location;

  @ForeignKey(() => UserAddress)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userAddressId: number;

  @BelongsTo(() => UserAddress)
  userAddress: UserAddress;

  @ForeignKey(() => ReturnOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  returnOrderId: number;

  @HasOne(() => ReturnOrder)
  returnOrder: ReturnOrder;

  @HasOne(() => Accounting)
  accounting: Accounting;

  @HasMany(() => OrderItem)
  items: OrderItem[];

  @BeforeDestroy
  static async beforeDestroyHook(
    instance: Order,
    options?: { transaction: Transaction }
  ) {
    const toDeleteOrderItems = await OrderItem.findAll({
      where: { orderId: instance.get("id") },
      attributes: ["id"],
    });

    const toDeleteCancelRequests = await CancelOrderRequest.findAll({
      where: { orderId: instance.get("id") },
      attributes: ["id"],
    });

    await Promise.all([
      destroyInstancesArray(
        toDeleteOrderItems as unknown as OrderItem[],
        options?.transaction
      ),
      destroyInstancesArray(
        toDeleteCancelRequests as unknown as CancelOrderRequest[],
        options?.transaction
      ),
    ]);
  }

  @BeforeSave
  static async beforeSaveHook(
    instance: Order | Order[],
    options: { transaction?: Transaction }
  ) {
    if (!instance) return;
    if (Array.isArray(instance)) {
      for (const record of instance) {
        record.grossTotal = record.subTotal + record.deliveryCost;
        record.finalPrice =
          record.grossTotal -
          record.totalDiscount -
          (record.returnedPrice || 0);
        record.finalPriceWithoutReturned =
          record.finalPrice + (record.returnedPrice || 0);
        if (record.status !== OrderStatusEnum.PLACED)
          record.canBeCanceled = false;
      }
    } else {
      instance.grossTotal = instance.subTotal + instance.deliveryCost;
      instance.finalPrice =
        instance.grossTotal -
        instance.totalDiscount -
        (instance.returnedPrice || 0);
      instance.finalPriceWithoutReturned =
        instance.finalPrice + (instance.returnedPrice || 0);
      if (instance.status !== OrderStatusEnum.PLACED)
        instance.canBeCanceled = false;
    }
    const queries: Promise<any>[] = [];
    await Promise.all(queries);
  }

  @BeforeUpdate
  static async beforeUpdateHook(
    instance: Order | Order[],
    options: { transaction?: Transaction }
  ) {
    if (!instance) return;
    if (Array.isArray(instance)) {
      for (const record of instance) {
        record.grossTotal = record.subTotal + record.deliveryCost;
        record.finalPrice =
          record.grossTotal -
          record.totalDiscount -
          (record.returnedPrice || 0);
        record.finalPriceWithoutReturned =
          record.finalPrice + (record.returnedPrice || 0);
        if (record.status !== OrderStatusEnum.PLACED)
          record.canBeCanceled = false;
      }
    } else {
      instance.grossTotal = instance.subTotal + instance.deliveryCost;
      instance.finalPrice =
        instance.grossTotal -
        instance.totalDiscount -
        (instance.returnedPrice || 0);
      instance.finalPriceWithoutReturned =
        instance.finalPrice + (instance.returnedPrice || 0);
      if (instance.status !== OrderStatusEnum.PLACED)
        instance.canBeCanceled = false;
    }
    const queries: Promise<any>[] = [];
    await Promise.all(queries);
  }
}

@Table({
  paranoid: true,
  tableName: "cancel_orders_requests",
  modelName: "CancelOrderRequest",
})
export class CancelOrderRequest extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    defaultValue: CancelOrderRequestStatusEnum.CANCELLED,
  })
  status: CancelOrderRequestStatusEnum;

  @Column({
    type: DataType.STRING,
    defaultValue: "Pending",
  })
  refundTarget: RefundTargetEnum | "Pending";

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
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
}
