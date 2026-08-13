import { FastifyInstance } from "fastify";
import { Op, Transaction } from "sequelize";
import { Booking, BookingStatus } from "./booking.model";
import { Room } from "../room/room.model";
import { RoomType } from "../room/room.model";
import { Hotel } from "../hotel/hotel.model";

export interface ICreateBooking {
	userId: number;
	roomTypeId: number;
	checkIn: string; // ISO datetime, e.g. 2026-08-12T14:00:00.000Z
	checkOut: string; // ISO datetime
	guestCount: number;
	guestPhone?: string;
}

const BookingService = (instance: FastifyInstance) => {
	/**
	 * Two bookings for the same room overlap iff:
	 *   existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
	 * Only PENDING_PAYMENT / CONFIRMED / CHECKED_IN bookings block a slot.
	 */
	const overlapWhere = (roomId: number, checkIn: Date, checkOut: Date) => ({
		roomId,
		status: { [Op.in]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
		checkIn: { [Op.lt]: checkOut },
		checkOut: { [Op.gt]: checkIn },
	});

	const privateMethods = {
		validateWindow: (hotel: Hotel, checkIn: Date, checkOut: Date) => {
			const durationHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
			if (durationHours <= 0) throw instance.httpErrors.badRequest("checkOut must be after checkIn");
			if (durationHours < hotel.minBookingHours) {
				throw instance.httpErrors.badRequest(`Minimum booking duration is ${hotel.minBookingHours} hour(s)`);
			}
			// TODO: also validate checkIn/checkOut clock time falls within hotel.openTime/closeTime
			return durationHours;
		},

		calculatePrice: (roomType: RoomType, hotel: Hotel, durationHours: number) => {
			const extraHours = Math.max(0, Math.ceil(durationHours - hotel.minBookingHours));
			return Number(roomType.basePriceForMinHours) + extraHours * Number(roomType.pricePerAdditionalHour);
		},
	};

	return {
		/**
		 * Returns rooms of the given room type that are free for the requested window.
		 * Used to render availability in the app before the user commits to booking.
		 */
		getAvailableRooms: async (roomTypeId: number, checkIn: Date, checkOut: Date) => {
			const rooms = await Room.findAll({ where: { roomTypeId, status: "available" } });
			const bookedRoomIds = (
				await Booking.findAll({
					attributes: ["roomId"],
					where: {
						roomId: { [Op.in]: rooms.map((r) => r.id) },
						status: { [Op.in]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
						checkIn: { [Op.lt]: checkOut },
						checkOut: { [Op.gt]: checkIn },
					},
				})
			).map((b) => b.roomId);
			return rooms.filter((r) => !bookedRoomIds.includes(r.id));
		},

		/**
		 * Creates a booking. Must run inside a transaction with the DB doing row-level locking
		 * (SELECT ... FOR UPDATE via `lock: transaction.LOCK.UPDATE`) so that two guests hitting
		 * "book now" for the last available room at the same instant can't both succeed.
		 * The unique index + this re-check are the real guarantee; a Redis lock in front of this
		 * (keyed by roomTypeId) is only an optional optimization to fail fast under high contention.
		 */
		createBooking: async (transaction: Transaction, dto: ICreateBooking) => {
			const checkIn = new Date(dto.checkIn);
			const checkOut = new Date(dto.checkOut);

			const roomType = await RoomType.findByPk(dto.roomTypeId, { transaction });
			if (!roomType || !roomType.isActive) throw instance.httpErrors.notFound("Room type not found");

			const hotel = await Hotel.findByPk(roomType.hotelId, { transaction });
			if (!hotel || !hotel.isActive) throw instance.httpErrors.notFound("Hotel not found");

			const durationHours = privateMethods.validateWindow(hotel, checkIn, checkOut);

			// Lock every room of this type for the duration of the transaction, then re-check overlap.
			const candidateRooms = await Room.findAll({
				where: { roomTypeId: dto.roomTypeId, status: "available" },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			if (!candidateRooms.length) throw instance.httpErrors.conflict("No rooms of this type exist");

			let freeRoom: Room | undefined;
			for (const room of candidateRooms) {
				const clash = await Booking.findOne({ where: overlapWhere(room.id, checkIn, checkOut), transaction });
				if (!clash) {
					freeRoom = room;
					break;
				}
			}
			if (!freeRoom) throw instance.httpErrors.conflict("No rooms available for the selected time window");

			const totalPrice = privateMethods.calculatePrice(roomType, hotel, durationHours);

			const booking = await Booking.create(
				{
					userId: dto.userId,
					hotelId: hotel.id,
					roomId: freeRoom.id,
					checkIn,
					checkOut,
					durationHours,
					totalPrice,
					guestCount: dto.guestCount,
					guestPhone: dto.guestPhone,
					status: BookingStatus.PENDING_PAYMENT,
				},
				{ transaction }
			);

			return booking;
		},

		cancelBooking: async (bookingId: number, userId: number, reason?: string) => {
			const booking = await Booking.findOne({ where: { id: bookingId, userId } });
			if (!booking) throw instance.httpErrors.notFound("Booking not found");
			if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
				throw instance.httpErrors.badRequest("Booking can no longer be cancelled");
			}
			booking.status = BookingStatus.CANCELLED;
			booking.cancellationReason = reason ?? null;
			await booking.save();
			return booking;
		},

		getUserBookings: async (userId: number) => {
			return Booking.findAll({
				where: { userId },
				include: [{ model: Room, include: [RoomType] }, Hotel],
				order: [["checkIn", "DESC"]],
			});
		},
	};
};

export default BookingService;
