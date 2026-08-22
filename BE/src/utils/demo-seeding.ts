import { getConfigs } from "./../configs/index";
import { Admin } from "./../modules/admin/admin.model";
import { AdminRole } from "src/modules/admin/utils/admin.enum";
import { Hotel } from "src/modules/hotel/hotel.model";
import { Room, RoomType } from "src/modules/room/room.model";
import { User } from "src/modules/user/user.model";
import { UserTypeEnum } from "src/types/common-types";

export const seedDemoBookingData = async (configs: Awaited<ReturnType<typeof getConfigs>>) => {
	if (!configs.db.demoSeed) return;

	const vendor = await Admin.findOne({ where: { role: AdminRole.admin } });
	if (!vendor) return;

	const existingHotel = await Hotel.findOne({ where: { name: "Hourly Stay Doha" } });
	if (!existingHotel) {
		const hotel = await Hotel.create({
			vendorId: vendor.id,
			name: "Hourly Stay Mumbai",
			description: "Demo hotel for the Flutter hourly-booking app. 3-hour minimum stay.",
			address: "Bandra West, Linking Road",
			city: "Mumbai",
			latitude: 19.06,
			longitude: 72.83,
			images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"],
			amenities: ["wifi", "parking", "ac", "pool"],
			openTime: "08:00",
			closeTime: "23:00",
			minBookingHours: 3,
			isApproved: true,
			isActive: true,
			rating: 4.5,
		});

		const deluxe = await RoomType.create({
			hotelId: hotel.id,
			name: "Deluxe King",
			description: "King bed, city view. Base price covers the hotel minimum hours.",
			images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200"],
			maxOccupancy: 2,
			basePriceForMinHours: 150,
			pricePerAdditionalHour: 35,
			isActive: true,
		});

		const twin = await RoomType.create({
			hotelId: hotel.id,
			name: "Standard Twin",
			description: "Two single beds. Good for short rest stops.",
			images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200"],
			maxOccupancy: 2,
			basePriceForMinHours: 110,
			pricePerAdditionalHour: 25,
			isActive: true,
		});

		await Room.bulkCreate([
			{ roomTypeId: deluxe.id, roomNumber: "101", status: "available" },
			{ roomTypeId: deluxe.id, roomNumber: "102", status: "available" },
			{ roomTypeId: twin.id, roomNumber: "201", status: "available" },
			{ roomTypeId: twin.id, roomNumber: "202", status: "available" },
		]);
	}

	const demoPhone = "+919876543210";
	const existingUser = await User.findOne({ where: { phoneNumber: demoPhone } });
	if (!existingUser) {
		await User.create({
			firstName: "Demo",
			lastName: "Guest",
			phoneNumber: demoPhone,
			email: "guest@demo.local",
			verified: true,
			blocked: false,
			role: UserTypeEnum.USER,
			preferredLang: "en",
		});
	}
};
