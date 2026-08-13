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
			title: { en: "New Collection!", ar: "عبايات جديدة!" },
			description: {
				en: "Find the suitable app for you, check the latest fashion trends for women app, be elegant",
				ar: "ابحثي عن العباءة المناسبة لك، اطلعي على أحدث صيحات الموضة للعباية النسائية، كوني أنيقة",
			},
		});
	}
	if (!marketingBanner) {
		mxBannerRank = await Banner.max("rank");
		await Banner.create({
			rank: mxBannerRank ? mxBannerRank + 1 : 1,
			image: "https://app.com/cdn/shop/files/Gold_Minimalist_Fashion_Stylist_Service_Medium_Banner.png?v=1737048521&width=3840",
			type: BannerType.Marketing,
			title: { en: "Try out new app!", ar: "قم بتصفح العبايات الجديدة!" },
			description: {
				en: "New year, new app, best products at best prices",
				ar: "سنة جديدة بعبايات جديدة، أفضل المنتجات بأفضل الأسعار",
			},
		});
	}
};
