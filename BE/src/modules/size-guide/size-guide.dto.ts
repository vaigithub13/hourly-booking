import { LangObject } from "src/types/common-types";

export interface EditSizeGuidesDto {
	sizeGuide: SizeMeasurements[];
	description?: LangObject;
}

export interface SizeMeasurements {
	sizeName: LangObject;
	bodyParts: {
		name: LangObject;
		measurements: {
			cm: number;
			inch: number;
		};
	}[];
}
