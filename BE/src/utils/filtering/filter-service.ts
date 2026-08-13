import { JObject, LangObject } from "./../../types/common-types";
import { Op, WhereOptions } from "sequelize";

interface IWhereOptionsBuilder {
  equals(
    key: string,
    value: number | string | boolean,
    inOr: boolean
  ): FilterService;

  substringLangObject(key: string, value: string): FilterService;

  substring(key: string, value: string, inOr?: boolean): FilterService;

  startsWith(key: string, value: string, inOr?: boolean): FilterService;

  inArray(key: string, valuesArray: any[], inOr?: boolean): FilterService;

  matchJsonbObject(key: string, object: JObject): FilterService;

  dateInRange(
    key: string,
    lowerBound?: Date | string,
    upperBound?: Date | string
  ): FilterService;

  numberBetween(
    key: string,
    lowerBound?: number,
    upperBound?: number
  ): FilterService;

  notEquals(
    key: string,
    value: number | string | boolean,
    inOr: boolean
  ): FilterService;

  substringLangObjectOR(
    key: string,
    value: string,
    inOr: boolean
  ): FilterService;

  substringInsensitive(
    key: string,
    value: string,
    inOr: boolean
  ): FilterService;

  build(): WhereOptions;
}

const opKeys = {
  and: Op.and as unknown as string,
  or: Op.or as unknown as string,
};

export class FilterService implements IWhereOptionsBuilder {
  constructor() {}

  protected result: JObject = {
    [opKeys.and]: [],
    [opKeys.or]: [],
  };

  notEquals(
    key: string,
    value: number | string | boolean,
    inOr: boolean = false
  ) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [key]: {
        [Op.ne]: value,
      },
    });
    return this;
  }

  equals(key: string, value: number | string | boolean, inOr: boolean = false) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [key]: value,
    });
    return this;
  }

  substringLangObject(key: string, value: string, inOr: boolean = false) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [`${key}.en`]: {
        [Op.substring]: value,
      },
    });
    this.result[logicalKey].push({
      [`${key}.ar`]: {
        [Op.substring]: value,
      },
    });
    return this;
  }

  substringLangObjectOR(key: string, value: string, inOr: boolean = false) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [Op.or]: [
        {
          [`${key}.en`]: {
            [Op.iRegexp]: value,
          },
        },
        {
          [`${key}.ar`]: {
            [Op.iRegexp]: value,
          },
        },
      ],
    });
    return this;
  }

  substring(key: string, value: string, inOr: boolean = true) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [key]: {
        [Op.substring]: value,
      },
    });
    return this;
  }

  substringInsensitive(key: string, value: string, inOr: boolean = true) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [key]: {
        [Op.iRegexp]: value,
      },
    });
    return this;
  }

  startsWith(
    key: string,
    value: string,
    inOr: boolean = true,
    multiLang: boolean = false
  ) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    if (multiLang) {
      this.result[logicalKey].push({
        [`${key}.en`]: {
          [Op.startsWith]: value,
        },
      });
      this.result[logicalKey].push({
        [`${key}.ar`]: {
          [Op.startsWith]: value,
        },
      });
    } else {
      this.result[logicalKey].push({
        [key]: { [Op.startsWith]: value },
      });
    }
    return this;
  }
  startsWithInsensitive(
    key: string,
    value: string,
    inOr: boolean = true,
    multiLang: boolean = false
  ) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    if (multiLang) {
      this.result[logicalKey].push({
        [`${key}.en`]: {
          [Op.iLike]: `${value}%`,
        },
      });
      this.result[logicalKey].push({
        [`${key}.ar`]: {
          [Op.iLike]: `${value}%`,
        },
      });
    } else {
      this.result[logicalKey].push({
        [key]: { [Op.iLike]: `${value}%`, },
      });
    }
    return this;
  }

  inArray(key: string, valuesArray: any[], inOr: boolean = false) {
    const logicalKey = inOr ? opKeys.or : opKeys.and;
    this.result[logicalKey].push({
      [key]: {
        [Op.in]: valuesArray,
      },
    });
    return this;
  }

  matchJsonbObject(key: string, object: JObject) {
    this.result[opKeys.and].push({
      [key]: {
        [Op.contains]: object,
      },
    });
    return this;
  }

  numberBetween(key: string, lowerBound?: number, upperBound?: number, lowerKey?: any, upperKey?: any) {
    if (lowerBound) {
      this.result[opKeys.and].push({
        [key]: {
          [lowerKey || Op.gte]: lowerBound,
        },
      });
    }
    if (upperBound) {
      this.result[opKeys.and].push({
        [key]: {
          [upperKey || Op.lte]: upperBound,
        },
      });
    }
    return this;
  }

  dateInRange(
    key: string,
    lowerBound?: Date | string,
    upperBound?: Date | string
  ) {
    if (lowerBound) {
      this.result[opKeys.and].push({
        [key]: {
          [Op.gte]: lowerBound,
        },
      });
    }
    if (upperBound) {
      this.result[opKeys.and].push({
        [key]: {
          [Op.lte]: upperBound,
        },
      });
    }
    return this;
  }

  build() {
    const options: WhereOptions = {};

    if (this.result[opKeys.and].length)
      options[opKeys.and] = this.result[opKeys.and];

    if (this.result[opKeys.or].length)
      options[opKeys.or] = this.result[opKeys.or];

    return options;
  }
}
