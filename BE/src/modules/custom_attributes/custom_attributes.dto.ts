import { AttributeEnum } from "src/types/enums";
import { LangObject } from "../../types/common-types";
import { CustomAttributes } from "./custom_attributes.model";

export interface editCustomAttributesDto {
	id: number;
	name: LangObject
}

export interface createCustomAttributesDto {
	name: LangObject;
	type: AttributeEnum;
}

export interface customAttributesResponse {
	id: number;
	type: AttributeEnum;
	name: string | LangObject;
}

export interface IFilterCustomAttributes {
	type?: AttributeEnum
}

export const CustomAttributesResponse = (data: CustomAttributes, langCode: string, multiLang?: boolean): customAttributesResponse => {
	return {
		id: data.id,
		type: data.type,
		name: multiLang ? data.name : data.name[langCode],
	};
};
