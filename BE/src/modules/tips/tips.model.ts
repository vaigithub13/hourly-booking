import { LangObject } from "../../types/common-types";
import { Table, Model, DataType, Column } from "sequelize-typescript";

@Table({
	tableName: "tips",
	modelName: "Tips",
})
export class Tips extends Model {
	@Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
	fabricCare: any;

	@Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
	washingMethods: any;
}
