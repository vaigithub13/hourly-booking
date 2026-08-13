import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { AdminRole } from "./utils/admin.enum";
import { Product } from "../product/product.model";
import { LangObject } from "../../types/common-types";
import { Banner } from "../banner/banner.model";
import { IUserMetaData, VendorStatus } from "./admin.dto";

@Table({
	tableName: "admins",
	modelName: "Admin",
})
export class Admin extends Model {
	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	email: string;

	@Column({ type: DataType.STRING })
	username: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	phoneNumber: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	password: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		defaultValue: AdminRole.vendor,
	})
	role: AdminRole;

	@Column({
		type: DataType.STRING,
	})
	name: string;

	@Column({
		type: DataType.JSONB,
	})
	vendorName: LangObject;

	@Column({
		type: DataType.STRING,
	})
	logo: string;

	@Column({
		type: DataType.JSONB,
	})
	address: any;

	@Column({
		type: DataType.STRING,
	})
	certificate: string;
	@Column({
		type: DataType.JSONB,
	})
	ownerName: LangObject;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	appPercentage: number;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	designerWallet: number;

	@Column({ type: DataType.STRING, defaultValue: VendorStatus.Approved })
	status: VendorStatus;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	blocked: boolean;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	totalRates: number;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	rateCount: number;

	@Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
	rate: number;

	@Column({
		type: DataType.STRING,
		defaultValue: "en",
	})
	preferredLang: string;

	@Column({
		type: DataType.JSONB,
	})
	forgetPasswordOtpMetaData: IUserMetaData;

	@HasMany(() => Product, {
		as: "products",
		onUpdate: "CASCADE",
		onDelete: "CASCADE",
	})
	products: Product[];

	@HasMany(() => Banner, { onUpdate: "CASCADE", onDelete: "CASCADE" })
	banners: Banner[];
}
