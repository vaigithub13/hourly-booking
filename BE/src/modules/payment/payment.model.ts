import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  paranoid: true,
  tableName: "payments",
  modelName: "Payments",
})
export class Payments extends Model {
  @Column({
    type: DataType.STRING,
  })
  uid: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  amount: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  transactionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  toPayWithWallet: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  locationId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  statusId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  skipCashResponse: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardType: string;
}
