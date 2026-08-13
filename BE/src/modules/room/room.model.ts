import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Hotel } from "../hotel/hotel.model";

// RoomType = "Deluxe Double", "Standard Single" etc — this is what pricing is attached to.
@Table({
	timestamps: true,
	tableName: "room_types",
	modelName: "RoomType",
	paranoid: true,
})
export class RoomType extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@ForeignKey(() => Hotel)
	@Column({ type: DataType.INTEGER, allowNull: false })
	hotelId: number;

	@BelongsTo(() => Hotel)
	hotel: Hotel;

	@Column({ type: DataType.STRING, allowNull: false })
	name: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	description: string;

	@Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
	images: string[];

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 2 })
	maxOccupancy: number;

	// Hourly-stay pricing model: a base price for the hotel's minBookingHours,
	// then an incremental price for every additional hour on top of that.
	@Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
	basePriceForMinHours: number;

	@Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
	pricePerAdditionalHour: number;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	isActive: boolean;

	@HasMany(() => Room)
	rooms: Room[];
}

// Room = a physical, individually bookable unit of a RoomType (Room 101, Room 102...)
// Availability is checked per Room, not per RoomType, so two guests can never double-book the same room.
@Table({
	timestamps: true,
	tableName: "rooms",
	modelName: "Room",
	paranoid: true,
})
export class Room extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@ForeignKey(() => RoomType)
	@Column({ type: DataType.INTEGER, allowNull: false })
	roomTypeId: number;

	@BelongsTo(() => RoomType)
	roomType: RoomType;

	@Column({ type: DataType.STRING, allowNull: false })
	roomNumber: string;

	@Column({ type: DataType.STRING, allowNull: false, defaultValue: "available" })
	status: "available" | "maintenance" | "inactive";
}
