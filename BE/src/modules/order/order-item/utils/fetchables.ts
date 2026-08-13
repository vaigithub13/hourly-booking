import { Includeable } from "sequelize";
import { CustomAttributes } from "src/modules/custom_attributes/custom_attributes.model";
import { Product, SKU } from "src/modules/product/product.model";
import { UserAddress } from "src/modules/user-address/user-address.model";
import { User } from "src/modules/user/user.model";

export const orderItemIncludes = (data: {
	all?: boolean;
	user?: boolean;
	sku?: boolean;
	userAddress?: boolean;
	isAdmin: boolean;
}): Includeable[] => {
	const { all, sku, user, userAddress, isAdmin } = data;
	let includes: Includeable[] = [];
	if (all) {
		includes = [
			{ model: CustomAttributes, as: "color" },
			{ model: CustomAttributes, as: "length" },
			{ model: CustomAttributes, as: "size" },
			{ model: User, paranoid: !isAdmin },
			{
				model: SKU,
				include: [Product, { association: "attributes" }],
				paranoid: !isAdmin,
			},
			{
				model: Product,
			},
		];
	} else {
		if (sku)
			includes.push({
				model: SKU,
				paranoid: !isAdmin,
				include: [{ model: Product, paranoid: !isAdmin }, { association: "attributes" }],
			});
		if (user) includes.push({ model: User, paranoid: !isAdmin });
		if (userAddress) includes.push(UserAddress);
	}
	return includes;
};
