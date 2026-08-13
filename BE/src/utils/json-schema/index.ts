import constants from "./../../utils/constants/shared-constants";
import { myDayjs } from "./../../utils/dayjs/my-dayjs";
import { Type, Static, TSchema } from "@sinclair/typebox";
import { Dayjs } from "dayjs";
export function StringEnum<T extends string[]>(_enum: [...T]) {
	return Type.Unsafe<T[number]>({ enum: _enum });
}

export const PaginatedSchema = <T extends TSchema>(type: T) => {
	return Type.Object({
		count: Type.Number(),
		rows: Type.Array(type),
	});
};

export const PaginationQuerySchema = {
	limit: Type.Number({ default: constants.DEFAULT_LIMIT }),
	offset: Type.Number({ default: constants.DEFAULT_SKIP }),
};

export const TwoLangsOrOne = Type.Union([
	Type.Object({
		en: Type.String(),
		ar: Type.String(),
	}),
	Type.String(),
]);

export const TwoLangs = Type.Object({
	en: Type.String(),
	ar: Type.String(),
});

export const Nullable = <T extends TSchema>(type: T) => Type.Union([type, Type.Null()]);

const Lang = StringEnum(["en", "ar", "es"]);
type Lang = Static<typeof Lang>;

export const headersSchema = Type.Object(
	{
		"x-lang": Type.String(Lang),
	},
	{ $id: "headers" }
);

export const langsSchema = Type.Object(
	{
		en: Type.String(),
		ar: Type.String(),
	},
	{ $id: "langs" }
);

export const langsSchema2 = Type.Object(
	{
		en: Type.String(),
		ar: Type.String(),
	},
	{ $id: "langs2" }
);

export const langsSchema3 = Type.Object(
	{
		en: Type.String(),
		ar: Type.String(),
	},
	{ $id: "langs3" }
);

export const locationSchema = Type.Object(
	{
		"x-lang": Type.String(Lang),
		lat: Type.Number(),
		lng: Type.Number(),
	},
	{ $id: "headers1" }
);
export const locationOptionalSchema = Type.Object(
	{
		"x-lang": Type.String(Lang),
		lat: Type.Optional(Type.Number()),
		lng: Type.Optional(Type.Number()),
	},
	{ $id: "headers2" }
);

export const deviceSchema = Type.Object(
	{
		"x-lang": Type.String(Lang),
		"x-deviceid": Type.Optional(Type.String()),
	},
	{ $id: "headers3" }
);

export const GenderEnum = StringEnum(["male", "female"]);
export type GenderEnum = Static<typeof GenderEnum>;

export const SocialEnum = StringEnum(["google", "facebook", "apple"]);
export type SocialEnum = Static<typeof SocialEnum>;

export enum SortDirectionEnum {
	ASC = "ASC",
	DESC = "DESC",
}
export interface TCustom<T> extends TSchema {
	$static: T;
}

export function CustomType<T = unknown>(schema: unknown): TCustom<T> {
	return schema as TCustom<T>;
}
export function formatDate(date?: Date | Dayjs): string {
	if (date && !(date instanceof Date) && !(date instanceof myDayjs)) {
		// If provided date is not a Date object, parse it
		date = new Date();
	}
	let result = myDayjs(date);
	return result.format();
}
