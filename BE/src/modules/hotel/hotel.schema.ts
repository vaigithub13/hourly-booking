import { Type } from "@sinclair/typebox";

const hotelBody = Type.Object({
	name: Type.String(),
	description: Type.Optional(Type.String()),
	address: Type.String(),
	city: Type.String(),
	latitude: Type.Number(),
	longitude: Type.Number(),
	images: Type.Optional(Type.Array(Type.String())),
	amenities: Type.Optional(Type.Array(Type.String())),
	openTime: Type.Optional(Type.String()),
	closeTime: Type.Optional(Type.String()),
	minBookingHours: Type.Optional(Type.Integer({ minimum: 1 })),
});

export const createHotel = { tags: ["Hotels"], body: hotelBody };
export const updateHotel = { tags: ["Hotels"], params: Type.Object({ hotelId: Type.Integer() }), body: Type.Partial(hotelBody) };
export const getHotel = { tags: ["Hotels"], params: Type.Object({ hotelId: Type.Integer() }) };
export const listHotels = {
	tags: ["Hotels"],
	querystring: Type.Object({
		limit: Type.Optional(Type.Integer()),
		offset: Type.Optional(Type.Integer()),
		city: Type.Optional(Type.String()),
	}),
};
