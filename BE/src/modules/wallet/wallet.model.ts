import {
  AfterFind,
  BeforeSave,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model";
import { getFastifyInstance } from "src/fastifyInstance";
import { Transaction } from "sequelize";

@Table({
  createdAt: true,
  updatedAt: true,
  tableName: "wallets",
  modelName: "Wallet",
})
export class Wallet extends Model {
  @Column({ type: DataType.STRING })
  balance: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @BeforeSave
  static async beforeSaveHook(instance: Wallet) {
    const queries: Promise<any>[] = [];
    const fastifyInstance = getFastifyInstance();
    instance.balance = await fastifyInstance.encryptBalance(
      instance.get("balance") || "0.00"
    );
    await Promise.all(queries);
  }

  @AfterFind
  static async afterFindHook(result: Wallet | Wallet[] | null) {
    if (!result) return;
    const queries: Promise<any>[] = [];
    const fastifyInstance = getFastifyInstance();
    if (Array.isArray(result)) {
      result.forEach(
        async (wallet: Wallet) =>
          (wallet.balance = await fastifyInstance.decryptBalance(
            wallet.get("balance")
          ))
      );
    } else if (result) {
      result.balance = await fastifyInstance.decryptBalance(
        result.get("balance")
      );
    }
    await Promise.all(queries);
  }
}
