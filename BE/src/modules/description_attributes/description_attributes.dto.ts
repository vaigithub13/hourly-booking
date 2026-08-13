import { AttributeEnum } from "src/types/enums";
import { LangObject } from "../../types/common-types";
import { CustomAttributes } from "./custom_attributes.model";



export enum WashingInstructions {
	HandWash = 'Hand Wash',
	DryClean = 'Dry Clean'
}

export enum IroningInstructions {
	Light = 'Light',
	Medium = 'Medium',
	Steam = 'Steam'
}

export enum Fabric {
	Felt = 'Felt',
	Silk = 'Silk',
	Lace = 'Lace',
	Chiffon = 'Chiffon'
}
export enum ProductType {
	Open = 'Open',
	Closed = 'Closed',
	Kaftan = 'Kaftan',
}

export enum DescriptionAttributeEnum {
	Type = 'Type',
	Fabric = 'Fabric',
	IroningInstructions = 'IroningInstructions',
	WashingInstructions = 'WashingInstructions',
}

export interface editCustomAttributesDto {
	id: number;
	name: LangObject
}

export interface createCustomAttributesDto {
	name: LangObject;
	type: DescriptionAttributeEnum;
}

export interface customAttributesResponse {
	id: number;
	type: DescriptionAttributeEnum;
	name: string | LangObject;
}

export interface IFilterCustomAttributes {
	type?: DescriptionAttributeEnum
}

export const CustomAttributesResponse = (data: CustomAttributes, langCode: string, multiLang: boolean): customAttributesResponse => {
	return {
		id: data.id,
		type: data.type,
		name: multiLang ? data.name : data.name[langCode],
	};
};
