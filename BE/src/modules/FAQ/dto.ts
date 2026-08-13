import { LangObject } from "src/types/common-types";
import { FAQ } from "./FAQ.model";

export interface FAQResponse {
	id: number;
	description: LangObject;
	title: LangObject;
}

export interface FAQDto {
	id?: number;
	description: LangObject;
	title: LangObject;
}

export const FAQResponse = (data: FAQ, langCode: string, multiLang: boolean): FAQResponse => {
	const { id, description, title } = data;
	return {
		id,
		description,
		title,
	};
};
