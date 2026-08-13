import { Includeable } from "sequelize";
import { Order } from "../order.model";
import { Location } from "src/modules/locations/locations.model";
import { User } from "src/modules/user/user.model";
import { Admin } from "src/modules/admin/admin.model";
import { OrderItem } from "../order-item/order-item.model";
import { orderItemIncludes } from "../order-item/utils/fetchables";
import { UserAddress } from "src/modules/user-address/user-address.model";
import { Accounting } from "src/modules/accounting/accounting.model";
import accounting from "src/modules/accounting";

export const orderIncludes = (data: {
	all?: boolean;
	user?: boolean;
	vendor?: boolean;
	location?: boolean;
	items?: boolean;
	accounting?: boolean;
	isAdmin: boolean;
}): Includeable[] => {
	const { all, items, location, user, vendor, isAdmin } = data;
	let includes: Includeable[] = [];
	if (all) {
		includes = [
			Accounting,
			Location,
			{ model: User, paranoid: !isAdmin },
			UserAddress,
			Admin,
			{
				model: OrderItem,
				include: orderItemIncludes({ all: true, isAdmin }),
				paranoid: !isAdmin,
			},
		];
	} else {
		if (user) includes.push({ model: User, paranoid: !isAdmin });
		if (vendor) includes.push({ association: "vendor" });
		if (location) includes.push(Location);
		if (items)
			includes.push({
				model: OrderItem,
				include: orderItemIncludes({ all: true, isAdmin }),
				paranoid: !isAdmin,
			});
		if (data.accounting) includes.push(Accounting);
	}
	return includes;
};

export const orderFetchedAttributes = {
	findAllOrders: () => [
		"id",
		"finalPrice",
		"subTotal",
		"grossTotal",
		"walletPaidAmount",
		"paymentStatus",
		"totalDiscount",
		"estimatedDeliveryDays",
		"canBeCanceled",
		"canBeReturned",
		"deliveryCost",
		"returnOrderId",
		"status",
		"createdAt",
		"paymentMethod",
		"deliveryId",
		"isPaid"
	],
};
