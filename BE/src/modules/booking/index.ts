import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import BookingService from "./booking.service";
import * as schema from "./booking.schema";
import { withTransaction } from "src/utils/sequelize";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const bookingService = BookingService(fastify);

	// GET /bookings/availability?roomTypeId=1&checkIn=...&checkOut=...
	instance.get(
		"/availability",
		{
			preValidation: instance.auth([instance.isAuthenticated], { relation: "and" }),
			schema: schema.checkAvailability,
		},
		async (request: FastifyRequestTypebox<typeof schema.checkAvailability>) => {
			const { roomTypeId, checkIn, checkOut } = request.query;
			const rooms = await bookingService.getAvailableRooms(roomTypeId, new Date(checkIn), new Date(checkOut));
			return { availableCount: rooms.length, rooms };
		}
	);

	// POST /bookings  -> creates a PENDING_PAYMENT booking, hand the returned id to the payment step
	instance.post(
		"/",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.createBooking,
		},
		async (request: FastifyRequestTypebox<typeof schema.createBooking>) => {
			const userId = (request.user as any).id;
			const { result: booking } = await withTransaction(instance.db, bookingService.createBooking, {
				...request.body,
				userId,
			});
			return booking;
		}
	);

	// GET /bookings/mine
	instance.get(
		"/mine",
		{ preValidation: instance.auth([instance.authenticate], { relation: "and" }) },
		async (request) => {
			const userId = (request.user as any).id;
			return bookingService.getUserBookings(userId);
		}
	);

	// PUT /bookings/:bookingId/cancel
	instance.put(
		"/:bookingId/cancel",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.cancelBooking,
		},
		async (request: FastifyRequestTypebox<typeof schema.cancelBooking>) => {
			const userId = (request.user as any).id;
			return bookingService.cancelBooking(request.params.bookingId, userId, request.body.reason);
		}
	);
};
