import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
	paranoid: true,
	tableName: "FAQ",
	modelName: "FAQs",
})
export class FAQ extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@Column({
		type: DataType.JSONB,
		allowNull: false,
	})
	title: {
		en: string;
		ar: string;
	};

	@Column({
		type: DataType.JSONB,
		allowNull: false,
	})
	description: {
		en: string;
		ar: string;
	};
}
