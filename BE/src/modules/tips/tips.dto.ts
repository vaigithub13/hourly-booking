import { LangObject } from "src/types/common-types";

export interface EditTips {
	fabricCare?: {
		key: LangObject;
		values: LangObject[];
	}[];

	washingMethods?: {
		key: LangObject;
		values: LangObject[];
	}[];
}
