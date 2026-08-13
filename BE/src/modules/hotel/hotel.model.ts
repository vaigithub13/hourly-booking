import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Admin } from "../admin/admin.model";
import { RoomType } from "../room/room.model";

// A Hotel is owned by an Admin whose role is "vendor" (see AdminRole.vendor) — this matches how
// Product.vendorId already works elsewhere in this codebase (see product.model.ts), rather than
// the separate, unused `Vendor` table.
@Table({
	timestamps: true,
	tableName: "hotels",
	modelName: "Hotel",
	paranoid: true,
})
export class Hotel extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@ForeignKey(() => Admin)
	@Column({ type: DataType.INTEGER, allowNull: false })
	vendorId: number;

	@BelongsTo(() => Admin, { as: "vendor", foreignKey: "vendorId" })
	vendor: Admin;

	@Column({ type: DataType.STRING, allowNull: false })
	name: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	description: string;

	@Column({ type: DataType.STRING, allowNull: false })
	address: string;

	@Column({ type: DataType.STRING, allowNull: false })
	city: string;

	@Column({ type: DataType.DECIMAL(10, 7), allowNull: false })
	latitude: number;

	@Column({ type: DataType.DECIMAL(10, 7), allowNull: false })
	longitude: number;

	@Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
	images: string[];

	@Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
	amenities: string[]; // wifi, parking, pool, ac ...

	// Daily operating window during which hourly slots can be booked, e.g. "08:00" - "23:00"
	@Column({ type: DataType.STRING, allowNull: false, defaultValue: "00:00" })
	openTime: string;

	@Column({ type: DataType.STRING, allowNull: false, defaultValue: "23:59" })
	closeTime: string;

	// Minimum booking duration in hours (common for hourly-stay hotels: 3)
	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
	minBookingHours: number;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	isApproved: boolean;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	isActive: boolean;

	@Column({ type: DataType.DECIMAL(3, 2), defaultValue: 0 })
	rating: number;

	@HasMany(() => RoomType)
	roomTypes: RoomType[];
}
