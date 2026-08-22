import { Type } from "@sinclair/typebox";

export const checkAvailability = {
	tags: ["Bookings"],
	querystring: Type.Object({
		roomTypeId: Type.Integer(),
		checkIn: Type.String({ format: "date-time" }),
		checkOut: Type.String({ format: "date-time" }),
	}),
};

export const createBooking = {
	tags: ["Bookings"],
	body: Type.Object({
		roomTypeId: Type.Integer(),
		checkIn: Type.String({ format: "date-time" }),
		checkOut: Type.String({ format: "date-time" }),
		guestCount: Type.Integer({ minimum: 1 }),
		guestPhone: Type.Optional(Type.String()),
	}),
};

export const cancelBooking = {
	tags: ["Bookings"],
	params: Type.Object({ bookingId: Type.Integer() }),
	body: Type.Object({ reason: Type.Optional(Type.String()) }),
};
