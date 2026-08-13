import { LangObject } from "../../types/common-types";
import { Table, Model, DataType, Column } from "sequelize-typescript";

const defaultSizeGuide = [
	{
		sizeName: {
			ar: "XS",
			en: "XS",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder ",
				},
				measurements: {
					cm: 36,
					inch: 14.2,
				},
			},
			{
				name: {
					ar: "محيط الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 88,
					inch: 34.6,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 84,
					inch: 33.1,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 92,
					inch: 36.2,
				},
			},
			{
				name: {
					ar: "الكم من الكتف",
					en: "Sleeves from shoulde",
				},
				measurements: {
					cm: 57,
					inch: 22.4,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 18,
					inch: 7.1,
				},
			},
			{
				name: {
					ar: "فتحة الذراع",
					en: "Armholes",
				},
				measurements: {
					cm: 22,
					inch: 8.7,
				},
			},
		],
	},
	{
		sizeName: {
			ar: "S",
			en: "S",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder",
				},
				measurements: {
					cm: 38,
					inch: 15,
				},
			},
			{
				name: {
					ar: "محيط  الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 94,
					inch: 37,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 90,
					inch: 35.4,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 98,
					inch: 38.6,
				},
			},
			{
				name: {
					ar: "الكم من الكتف",
					en: "Sleeves from shoulde",
				},
				measurements: {
					cm: 58,
					inch: 22.8,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 19,
					inch: 7.5,
				},
			},
			{
				name: {
					ar: "فتحة الذراع",
					en: "Armholes",
				},
				measurements: {
					cm: 23,
					inch: 9.1,
				},
			},
		],
	},
	{
		sizeName: {
			ar: "M",
			en: "M",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder ",
				},
				measurements: {
					cm: 40,
					inch: 15.7,
				},
			},
			{
				name: {
					ar: "محيط الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 100,
					inch: 39.4,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 96,
					inch: 37.8,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 104,
					inch: 40.9,
				},
			},
			{
				name: {
					ar: "الكم من الكتف",
					en: "Sleeves from shoulde",
				},
				measurements: {
					cm: 59,
					inch: 23.2,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 20,
					inch: 7.9,
				},
			},
			{
				name: {
					ar: "فتحة الذراع",
					en: "Armholes",
				},
				measurements: {
					cm: 24,
					inch: 9.4,
				},
			},
		],
	},
	{
		sizeName: {
			ar: "L",
			en: "L",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder ",
				},
				measurements: {
					cm: 42,
					inch: 16.5,
				},
			},
			{
				name: {
					ar: "محيط  الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 106,
					inch: 41.7,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 102,
					inch: 40.2,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 110,
					inch: 43.3,
				},
			},
			{
				name: {
					ar: "الكم من الكتف",
					en: "Sleeves from shoulde",
				},
				measurements: {
					cm: 60,
					inch: 23.6,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 21,
					inch: 8.3,
				},
			},
			{
				name: {
					ar: "فتحة الذراع",
					en: "Armholes",
				},
				measurements: {
					cm: 25,
					inch: 9.8,
				},
			},
		],
	},
	{
		sizeName: {
			ar: "XL",
			en: "XL",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder",
				},
				measurements: {
					cm: 44,
					inch: 17.3,
				},
			},
			{
				name: {
					ar: "محيط الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 112,
					inch: 44.1,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 108,
					inch: 42.5,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 116,
					inch: 45.7,
				},
			},
			{
				name: {
					ar: "طول الكم",
					en: "Sleeves from Shoulde",
				},
				measurements: {
					cm: 61,
					inch: 24,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 22,
					inch: 8.7,
				},
			},
			{
				name: {
					ar: "فتحة الذراع ",
					en: "Armholes",
				},
				measurements: {
					cm: 26,
					inch: 10.2,
				},
			},
		],
	},
	{
		sizeName: {
			ar: "XXL",
			en: "XXL",
		},
		bodyParts: [
			{
				name: {
					ar: "عرض الكتف",
					en: "Shoulder",
				},
				measurements: {
					cm: 46,
					inch: 18.1,
				},
			},
			{
				name: {
					ar: "محيط الصدر",
					en: "Bust",
				},
				measurements: {
					cm: 118,
					inch: 46.5,
				},
			},
			{
				name: {
					ar: "محيط الخصر",
					en: "Waist",
				},
				measurements: {
					cm: 114,
					inch: 44.9,
				},
			},
			{
				name: {
					ar: "محيط الحوض",
					en: "Hips",
				},
				measurements: {
					cm: 122,
					inch: 48,
				},
			},
			{
				name: {
					ar: "الطول من الكتف",
					en: "Sleeves from Shoulde",
				},
				measurements: {
					cm: 62,
					inch: 24.4,
				},
			},
			{
				name: {
					ar: "عرض الكم",
					en: "Sleeves Width",
				},
				measurements: {
					cm: 23,
					inch: 9.1,
				},
			},
			{
				name: {
					ar: "فتحة الذراع",
					en: "Armholes",
				},
				measurements: {
					cm: 27,
					inch: 10.6,
				},
			},
		],
	},
];

@Table({
	tableName: "size_guide",
	modelName: "Size_Guide",
})
export class SizeGuide extends Model {
	@Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true, defaultValue: defaultSizeGuide })
	sizeGuide: any;

	@Column({ type: DataType.JSONB, allowNull: true })
	description: LangObject;
}
