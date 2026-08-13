import { FastifyInstance } from "fastify";
import { Hotel } from "./hotel.model";
import { RoomType } from "../room/room.model";

const HotelService = (instance: FastifyInstance) => {
	return {
		listHotels: async (query: { limit?: number; offset?: number; city?: string }) => {
			const where: any = { isActive: true, isApproved: true };
			if (query.city) where.city = query.city;
			return Hotel.findAndCountAll({
				where,
				limit: query.limit ?? 20,
				offset: query.offset ?? 0,
				include: [RoomType],
			});
		},

		getHotelById: async (hotelId: number) => {
			const hotel = await Hotel.findByPk(hotelId, { include: [RoomType] });
			if (!hotel) throw instance.httpErrors.notFound("Hotel not found");
			return hotel;
		},

		createHotel: async (vendorId: number, dto: Partial<Hotel>) => {
			return Hotel.create({ ...dto, vendorId, isApproved: false });
		},

		updateHotel: async (hotelId: number, vendorId: number, dto: Partial<Hotel>) => {
			const hotel = await Hotel.findOne({ where: { id: hotelId, vendorId } });
			if (!hotel) throw instance.httpErrors.notFound("Hotel not found");
			await hotel.update(dto);
			return hotel;
		},

		approveHotel: async (hotelId: number) => {
			const hotel = await Hotel.findByPk(hotelId);
			if (!hotel) throw instance.httpErrors.notFound("Hotel not found");
			hotel.isApproved = true;
			await hotel.save();
			return hotel;
		},

		listHotelsForVendor: async (vendorId: number) => {
			return Hotel.findAll({ where: { vendorId }, include: [RoomType] });
		},
	};
};

export default HotelService;
