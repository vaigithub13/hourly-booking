import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify/types/instance";
import HotelService from "./hotel.service";
import * as schema from "./hotel.schema";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";

export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const hotelService = HotelService(fastify);

	// Public: browse hotels (Flutter app home screen / search)
	instance.get("/", { schema: schema.listHotels }, async (request: FastifyRequestTypebox<typeof schema.listHotels>) => {
		return hotelService.listHotels(request.query);
	});

	instance.get("/:hotelId", { schema: schema.getHotel }, async (request: FastifyRequestTypebox<typeof schema.getHotel>) => {
		return hotelService.getHotelById(request.params.hotelId);
	});

	// Vendor: manage own hotels
	instance.get(
		"/vendor/mine",
		{ preValidation: instance.auth([instance.authenticate], { relation: "and" }) },
		async (request) => hotelService.listHotelsForVendor((request.user as any).id)
	);

	instance.post(
		"/",
		{ preValidation: instance.auth([instance.authenticate], { relation: "and" }), schema: schema.createHotel },
		async (request: FastifyRequestTypebox<typeof schema.createHotel>) => {
			return hotelService.createHotel((request.user as any).id, request.body);
		}
	);

	instance.put(
		"/:hotelId",
		{ preValidation: instance.auth([instance.authenticate], { relation: "and" }), schema: schema.updateHotel },
		async (request: FastifyRequestTypebox<typeof schema.updateHotel>) => {
			return hotelService.updateHotel(request.params.hotelId, (request.user as any).id, request.body);
		}
	);

	// Admin: approve a hotel before it appears publicly
	instance.put(
		"/:hotelId/approve",
		{ preValidation: instance.auth([instance.authenticate, instance.authorizeAdmin], { relation: "and" }), schema: schema.getHotel },
		async (request: FastifyRequestTypebox<typeof schema.getHotel>) => {
			return hotelService.approveHotel(request.params.hotelId);
		}
	);
};
