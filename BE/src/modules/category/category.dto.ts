import { LangObject } from "../../types/common-types";
import { Category } from "./category.model";

export interface editCategoryDto {
	id: number;
	name: LangObject;
}

export interface createCategoryDto {
	name: string | LangObject;
}

export interface ICategoryResponse {
	id: number;
	image: string;
	name: string | LangObject;
	isRequiredLength: boolean;
}

export const CategoryResponse = (data: Category, langCode: string, multiLang: boolean): ICategoryResponse => {
	return {
		id: data.id,
		image: data.image,
		isRequiredLength: data.isRequiredLength,
		name: multiLang ? data.name : data.name[langCode],
	};
};
