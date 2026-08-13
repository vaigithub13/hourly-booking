import { LangObject } from "../../types/common-types";
import { Blogger } from "./blogger.model";

export interface CreateBlogger {
	name: LangObject;
	logo: string;
	email: string;
}
export interface UpdateBlogger {
	id: number;
	name?: string | LangObject;
	logo?: string;
	email?: string;
}
export interface BloggerResponse {
	id: number;
	name: string | LangObject;
	logo: string;
	email: string;
}
export interface GetBloggersQuery {
	search?: string;
}

export const bloggerResponse = (blogger: Blogger, langCode: string, isAdmin: boolean = false) => {
	const { id, name, logo, email } = blogger;
	const response: BloggerResponse = {
		id,
		name: isAdmin ? name : name[langCode],
		logo,
		email,
	};
	return response;
};
