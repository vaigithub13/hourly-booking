import { BannerType } from "src/modules/banner/banner.dto";
import { Banner } from "src/modules/banner/banner.model";

export const runOnAppInit = async () => {
	const adminBanner = await Banner.findOne({
		where: { type: BannerType.Admin },
	});
	const marketingBanner = await Banner.findOne({
		where: { type: BannerType.Marketing },
	});
	let mxBannerRank: number | null = null;
	if (!adminBanner) {
		mxBannerRank = await Banner.max("rank");
		await Banner.create({
			rank: mxBannerRank ? mxBannerRank + 1 : 1,
			image: "https://sc04.alicdn.com/kf/Afb81d6f323a844ab99c2c58fc179b54bT/1144391/Afb81d6f323a844ab99c2c58fc179b54bT.jpg",
			type: BannerType.Admin,
			title: { en: "New Collection!", ar: "New Collection!" },
			description: {
				en: "Find the stay that suits you. Browse hourly rooms and book in minutes.",
				ar: "Find the stay that suits you. Browse hourly rooms and book in minutes.",
			},
		});
	}
	if (!marketingBanner) {
		mxBannerRank = await Banner.max("rank");
		await Banner.create({
			rank: mxBannerRank ? mxBannerRank + 1 : 1,
			image: "https://app.com/cdn/shop/files/Gold_Minimalist_Fashion_Stylist_Service_Medium_Banner.png?v=1737048521&width=3840",
			type: BannerType.Marketing,
			title: { en: "Try hourly stays!", ar: "Try hourly stays!" },
			description: {
				en: "Book rooms by the hour at the best available rates.",
				ar: "Book rooms by the hour at the best available rates.",
			},
		});
	}
};
