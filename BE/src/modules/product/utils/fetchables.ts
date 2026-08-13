import { Includeable } from "sequelize";
import { Product, SKU } from "../product.model";
import { Category } from "src/modules/category/category.model";
import { Vendor } from "src/modules/vendor/vendor.model";

// This file to put the includes in it
export const productIncludes: Includeable[] = [SKU, Category, Vendor];

export const fetchedAttributes = {};
