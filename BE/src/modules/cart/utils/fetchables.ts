import { Includeable } from "sequelize";
import { CartItem } from "../cart.model";
import { Product, SKU } from "src/modules/product/product.model";
import { Category } from "src/modules/category/category.model";
import { User } from "src/modules/user/user.model";
import { UserAddress } from "src/modules/user-address/user-address.model";
import { CustomAttributes } from "src/modules/custom_attributes/custom_attributes.model";
import { Admin } from "src/modules/admin/admin.model";

export const cartIncludes: Includeable[] = [
	{
		model: CartItem,
		order: ["id", "ASC"],
		include: [
			{ model: Product, include: [Admin] },
			{ model: CustomAttributes, as: "color" },
			{ model: CustomAttributes, as: "length" },
			{ model: CustomAttributes, as: "size" },
			{
				model: SKU,
				include: [{ model: Product, include: [Admin] }, { association: "attributes" }],
			},
		],
	},
	User,
	{ model: UserAddress },
];

export const cartItemIncludes: Includeable[] = [
	{
		model: SKU,
		include: [{ model: Product }],
	},
	Product,
];
