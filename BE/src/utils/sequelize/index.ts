import { Sequelize, Transaction } from "sequelize";
import { Model } from "sequelize-typescript";

export const withTransaction = async <T>(
  dbInstance: Sequelize,
  fn: (transaction: Transaction, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<{ result: T }> => {
  const transaction = await dbInstance.transaction();
  try {
    const result = await fn(transaction, ...args);
    await transaction.commit();
    return { result };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const destroyInstancesArray = async <T>(
  recordsArray: T[],
  transaction?: Transaction
) => {
  const deletedRecords: Promise<void>[] = [];
  for (const record of recordsArray) {
    if (record instanceof Model) {
      deletedRecords.push(record.destroy({ transaction }));
    }
  }
  await Promise.all(deletedRecords);
  return;
};
