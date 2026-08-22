import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import { Type } from "@sinclair/typebox";
import { RoomType, Room } from "./room.model";

const roomTypeBody = Type.Object({
	hotelId: Type.Integer(),
	name: Type.String(),
	description: Type.Optional(Type.String()),
	images: Type.Optional(Type.Array(Type.String())),
	maxOccupancy: Type.Optional(Type.Integer()),
	basePriceForMinHours: Type.Number(),
	pricePerAdditionalHour: Type.Number(),
});

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();

	instance.get(
		"/types",
		{
			schema: {
				tags: ["Rooms"],
				querystring: Type.Object({ hotelId: Type.Integer() }),
			},
		},
		async (request: any) => {
			return RoomType.findAll({ where: { hotelId: request.query.hotelId, isActive: true }, include: [Room] });
		}
	);

	// Vendor: add a room type to their hotel
	instance.post(
		"/types",
		{ preValidation: instance.auth([instance.authenticate], { relation: "and" }), schema: { body: roomTypeBody } },
		async (request: any) => {
			return RoomType.create(request.body);
		}
	);

	// Vendor: add physical rooms (units) to a room type, e.g. Room 101, 102, 103
	instance.post(
		"/",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: { body: Type.Object({ roomTypeId: Type.Integer(), roomNumber: Type.String() }) },
		},
		async (request: any) => {
			return Room.create(request.body);
		}
	);
};
