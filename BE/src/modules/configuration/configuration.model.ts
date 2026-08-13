import { LangObject } from "../../types/common-types";
import { Table, Model, DataType, Column } from "sequelize-typescript";

@Table({
	tableName: "configurations",
	modelName: "Configuration",
})
export class Configuration extends Model {
	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	payment: boolean;

	@Column({
		type: DataType.JSONB,
		defaultValue: { en: "Welcome to APP", ar: "مرحبا بك في عبايتي" },
	})
	homePageText: LangObject;

	@Column({
		type: DataType.JSONB,
		defaultValue: { en: "Privacy & Policy", ar: "السياسات والخصوصيات" },
	})
	privacyAndPolicy: LangObject;

	@Column({ type: DataType.STRING, defaultValue: "app@support.com" })
	supportEmail: string;

	@Column({ type: DataType.STRING, defaultValue: "admintest@app.qa" })
	eventsReceivingEmail: string;

	@Column({
		type: DataType.JSONB,
		defaultValue: { en: "Terms & Conditions", ar: "الشروط والأتفاقيات" },
	})
	termsAndConditions: LangObject;

	@Column({
		type: DataType.JSONB,
		defaultValue: { insideDoha: 0, outsideDoha: 0 },
	})
	deliveryPricing: { insideDoha: number; outsideDoha: number };

	@Column({ type: DataType.ARRAY(DataType.JSONB), defaultValue: null })
	assetLinks: any;

	@Column({ type: DataType.JSONB, defaultValue: null })
	appleAppSiteAssociation: object;

	@Column({
		type: DataType.STRING,
		defaultValue: "",
	})
	whatsappNumber: string;

	@Column({ type: DataType.ARRAY(DataType.JSONB), defaultValue: [] })
	ordersReturnReasons: LangObject[];

	@Column({ type: DataType.ARRAY(DataType.JSONB), defaultValue: [] })
	ordersCancelReasons: LangObject[];

	@Column({ type: DataType.INTEGER, defaultValue: 30 })
	walletRefundTimeInMinutes: number;
}
