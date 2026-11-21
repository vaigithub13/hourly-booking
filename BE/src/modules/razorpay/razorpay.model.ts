import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";

export enum BookingPaymentStatus {
	CREATED = "created", // Razorpay order created, guest has not paid yet
	PAID = "paid", // payment captured, booking confirmed
	FAILED = "failed",
	REFUND_PENDING = "refund_pending",
	REFUNDED = "refunded",
	EXPIRED = "expired", // guest never paid, slot released
}

/** One row per Razorpay order created for a booking. */
@Table({
	timestamps: true,
	tableName: "booking_payments",
	modelName: "BookingPayment",
	indexes: [{ unique: true, fields: ["razorpayOrderId"] }, { fields: ["bookingId"] }],
})
export class BookingPayment extends Model {
	@Column({ type: DataType.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true })
	id: number;

	@ForeignKey(() => Booking)
	@Column({ type: DataType.INTEGER, allowNull: false })
	bookingId: number;

	@BelongsTo(() => Booking)
	booking: Booking;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	userId: number;

	@Column({ type: DataType.STRING, allowNull: false })
	razorpayOrderId: string;

	@Column({ type: DataType.STRING, allowNull: true })
	razorpayPaymentId: string | null;

	/** Amount in paise (₹1 = 100 paise), exactly what Razorpay charges. */
	@Column({ type: DataType.INTEGER, allowNull: false })
	amountPaise: number;

	@Column({ type: DataType.STRING, allowNull: false, defaultValue: "INR" })
	currency: string;

	@Column({
		type: DataType.ENUM(...Object.values(BookingPaymentStatus)),
		allowNull: false,
		defaultValue: BookingPaymentStatus.CREATED,
	})
	status: BookingPaymentStatus;

	@Column({ type: DataType.STRING, allowNull: true })
	method: string | null;

	@Column({ type: DataType.STRING, allowNull: true })
	razorpayRefundId: string | null;

	@Column({ type: DataType.INTEGER, allowNull: true })
	refundAmountPaise: number | null;

	@Column({ type: DataType.STRING, allowNull: true })
	failureReason: string | null;
}
