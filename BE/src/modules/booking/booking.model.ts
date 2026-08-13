import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Room } from "../room/room.model";
import { User } from "../user/user.model";
import { Hotel } from "../hotel/hotel.model";

export enum BookingStatus {
	PENDING_PAYMENT = "pending_payment",
	CONFIRMED = "confirmed",
	CHECKED_IN = "checked_in",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	NO_SHOW = "no_show",
}

@Table({
	timestamps: true,
	tableName: "bookings",
	modelName: "Booking",
	paranoid: true,
	indexes: [
		// speeds up the overlap query every single booking attempt runs
		{ fields: ["roomId", "checkIn", "checkOut"] },
	],
})
export class Booking extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	})
	id: number;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	userId: number;

	@BelongsTo(() => User)
	user: User;

	@ForeignKey(() => Hotel)
	@Column({ type: DataType.INTEGER, allowNull: false })
	hotelId: number;

	@BelongsTo(() => Hotel)
	hotel: Hotel;

	@ForeignKey(() => Room)
	@Column({ type: DataType.INTEGER, allowNull: false })
	roomId: number;

	@BelongsTo(() => Room)
	room: Room;

	// Exact timestamps, not just dates — this is the core difference from a nightly-stay booking system.
	@Column({ type: DataType.DATE, allowNull: false })
	checkIn: Date;

	@Column({ type: DataType.DATE, allowNull: false })
	checkOut: Date;

	@Column({ type: DataType.INTEGER, allowNull: false })
	durationHours: number;

	@Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
	totalPrice: number;

	@Column({
		type: DataType.ENUM(...Object.values(BookingStatus)),
		allowNull: false,
		defaultValue: BookingStatus.PENDING_PAYMENT,
	})
	status: BookingStatus;

	@Column({ type: DataType.STRING, allowNull: true })
	guestPhone: string;

	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
	guestCount: number;

	@Column({ type: DataType.STRING, allowNull: true })
	cancellationReason: string;
}
