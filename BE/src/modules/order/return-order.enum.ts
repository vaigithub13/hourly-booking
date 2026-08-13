export enum ReturnOrderRequestStatusEnum {
	Pending = "Pending",
	PendingAdmin = "PendingAdmin",
	Approved = "Approved",
	PickUp = "PickUp",
	OnTheWay = "OnTheWay",
	Rejected = "Rejected",
	Complete = "Complete",
}

export const returnOrderStatus = {
	[ReturnOrderRequestStatusEnum.Pending]: { code: 1, en: "Pending", ar: "معلق" },
	[ReturnOrderRequestStatusEnum.PendingAdmin]: { code: 2, en: "Pending From Admin", ar: "معلق من الادمن" },
	[ReturnOrderRequestStatusEnum.Approved]: { code: 3, en: "Approved", ar: "تم القبول" },
	[ReturnOrderRequestStatusEnum.PickUp]: { code: 4, en: "Pick up", ar: "قيد الشحن" },
	[ReturnOrderRequestStatusEnum.OnTheWay]: { code: 5, en: "On The Way", ar: "على الطريق" },
	[ReturnOrderRequestStatusEnum.Complete]: { code: 6, en: "Complete", ar: "تم التوصيل" },
	[ReturnOrderRequestStatusEnum.Rejected]: { code: 7, en: "Rejected", ar: "مرفوض" },
};

export const ReturnOrderStatusData = [
	{ statusId: 1001, status: ReturnOrderRequestStatusEnum.Pending },
	{ statusId: 1002, status: ReturnOrderRequestStatusEnum.PendingAdmin },
	{ statusId: 1003, status: ReturnOrderRequestStatusEnum.Approved },
	{ statusId: 1004, status: ReturnOrderRequestStatusEnum.PickUp },
	{ statusId: 1005, status: ReturnOrderRequestStatusEnum.OnTheWay },
	{ statusId: 1006, status: ReturnOrderRequestStatusEnum.Complete },
	{ statusId: 1007, status: ReturnOrderRequestStatusEnum.Rejected },
];

export const returnOrderStatusForTracking = [
	{ code: 4, status: ReturnOrderRequestStatusEnum.OnTheWay },
	{ code: 5, status: ReturnOrderRequestStatusEnum.Complete },
];
