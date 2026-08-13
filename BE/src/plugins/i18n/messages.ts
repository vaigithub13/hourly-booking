export default {
  "common.response.notFound": {
    en: "Not Found",
    ar: "لم يتم العثور على المطلوب",
  },
  "common.response.success": {
    en: "Action Completed Successfully",
    ar: "تم الانتهاء من الإجراء بنجاح",
  },
  "common.response.notAllowedResource": {
    en: "Not allowed to do this action, resource is forbidden !",
    ar: "غير مسموح لك التعديل على هذا المصدر !",
  },
  //* Users
  "user.response.usedPhoneNumber": {
    en: "PhoneNumber is already used.",
    ar: "رقم الهاتف مستخدم بالفعل.",
  },
  "user.response.usedEmail": {
    en: "Email is already used.",
    ar: "البريد الإلكتروني مستخدم بالفعل.",
  },
  "user.otp.wrong": {
    en: "The OTP entered is incorrect. Please try again !",
    ar: "الرمز الذي أدخلته خاطئ، أعد المحاولة !",
  },
  "user.otp.wait": {
    en: "You should wait a minute before asking for new OTP",
    ar: "يجب عليك الإنتظار لمدة دقيقة قبل محاولة طلب رمز آخر",
  },
  "user.otp.notValid": {
    en: "Code is not valid anymore!",
    ar: "الرمز غير صالح !",
  },
  "user.response.notFound": {
    en: "User not Found",
    ar: "المستخدم غير موجود",
  },
  "user.response.existsPhoneNumber": {
    en: "User with the same phone number exists !",
    ar: "يوجد بالفعل مستخدم بنفس رقم الهاتف !",
  },
  "user.response.existsEmail": {
    en: "User with the same email exists !",
    ar: "يوجد بالفعل مستخدم بنفس البريد الالكتروني !",
  },
  "user.response.notFoundByPhoneNumber": {
    en: "User not found, try using email.",
    ar: ".المستخدم غير موجود، حاول التجربة باستخدام البريد الالكتروني",
  },
  "user.response.notFoundByEmail": {
    en: "User not Found, try using phone number.",
    ar: "المستخدم غير موجود، حاول استخدام رقم الهاتف.",
  },
  "user.response.emailProvidedAndTargetIsPhone": {
    en: "The OTP destination is wrong, you provided email and the destination is phoneNumber",
    ar: "وجهة إرسال رمز التاكيد خاطئ، لقد قدمت البريد الإلكتروني ووجهة الإرسال هو رقم الهاتف",
  },
  "user.response.phoneNumberProvidedAndTargetIsEmail": {
    en: "The OTP destination is wrong, you provided phoneNumber and the destination is email",
    ar: "وجهة إرسال رمز التاكيد خاطئ، لقد قدمت رقم الهاتف ووجهة الإرسال هو البريد الإلكتروني",
  },

  //* Products
  "product.serial.existed": {
    en: "This serial number is already exists for another product",
    ar: "هذا الرقم التسلسلي موجود بالفعل لمنتج آخر",
  },
  "product.response.skuNotFound": {
    en: "Stock keeping unit (item) not found !",
    ar: "المنتج غير موجود !",
  },

  //* Cart
  "cart.response.notFound": {
    en: "Cart not found !",
    ar: "سلة الشراء غير موجودة !",
  },
  "cartItem.response.notFound": {
    en: "Some of cart items not found, make sure they exist",
    ar: "بعض الأغراض في العربة غير موجودة، تأكد من وجودها قبل التعديل",
  },
  "cartItem.response.notEnoughQuantity": {
    en: "There's no enough quantity of some item !",
    ar: "لا يوجد كمية كافية من غرض ما !",
  },
  "cart.response.validatedSuccessfully": {
    en: "Cart validated successfully, There are no issues",
    ar: "تم التأكد من سلة البضائع، لا يوجد خطأ",
  },
  "cart.response.itemsMoreThanVendor": {
    en: "The cart contains items from more than one vendor, Please add products from one vendor !",
    ar: "سلة الشراء تحتوي على أغراض من بائعين مختلفين، الرجاء وضع أغراض لبائع واحد",
  },
  "cart.response.empty": {
    en: "Cart is empty, Try to add items before making an order !",
    ar: "السلة فارغة، أضف أغراض لتتمكن من إنشاء طلب !",
  },
  "cart.response.userAddressShouldBeProvided": {
    en: "You should provide address before proceeding!",
    ar: "يجب عليك تحديد عنوان قبل التقدم بالطلب !",
  },

  //* Order
  "order.response.cannotChangeCancelledStatus": {
    en: "Cannot change status of cancelled order !",
    ar: "لا يمكنك تغيير حالة طلب ملغى !",
  },
  "order.response.cannotChangeStatusBack": {
    en: "Cannot change status to previously passed status !",
    ar: "لا يمكنك تغير حالة طلب إلى حالة قد مر بها بالفعل !",
  },
  "order.response.cannotCancel": {
    en: "You cannot cancel already confirmed order, try returning the order !",
    ar: "لا يمكنك إلغاء طلب مقبول بالفعل، حاول إرجاع الطلب !",
  },
  "order.response.onlyVendorCanCancel": {
    en: "Only vendor can cancel his orders !",
    ar: "فقط البائع يمكنه إلغاء الطلبات الخاصة به !",
  },
  "order.response.notFound": {
    en: "Order not found !",
    ar: "الطلب غير موجود !",
  },
  "order.response.alreadyRequestedForCancel": {
    en: "You cannot change the status of the request, because it is already submitted for cancellation !",
    ar: "لا يمكنك تغيير حالة الطلب لأنه تم تقديمه بالفعل للإلغاء!",
  },
  "order.response.maximumRefundValueExceeded": {
    en: "Refund limit exceeded, refunded value should not exceed the order price",
    ar: "تم تجاوز حد الاسترداد، ويجب ألا تتجاوز القيمة المستردة سعر الطلب",
  },
  "order.response.walletRefundedValueNotProvided": {
    en: "Wallet refunded value should be provided, when refund target it wallet",
    ar: "يجب توفير قيمة استرداد المحفظة، عندما يكون هدف الاسترداد هو المحفظة",
  },

  //* Cancel Order
  "cancelOrderReq.response.onlyVendorCanApproveOrReject": {
    en: "Only vendor of the order can approve or reject his orders !",
    ar: "البائع يمكنه فقط إلغاء أو قبول الطلبات لمنتجاته حصراً",
  },
  "cancelOrderReq.response.cannotChangeStatus": {
    en: "The status of the request is already approved or rejected, you cannot change it !",
    ar: "حالة الطلب هي بالفعل تمت الموافقة عليها أو رفضها، لا يمكنك تغييرها !",
  },
  "orderCancelReq.response.alreadyExist": {
    en: "There is already pending cancel request for this order, you cannot create one !",
    ar: "هناك بالفعل طلب إلغاء معلق لهذا الطلب، لا يمكنك إنشاء واحد جديد !",
  },
  "cancelOrderReq.response.notFound": {
    en: "Cancel order request not found !",
    ar: "طلب الإلغاء غير موجود !",
  },
  "cancelOrderReq.response.refundTargetAlreadySet": {
    en: "Refund target already set!",
    ar: "مكان ارجاع المبلغ قد تم تحديده",
  },

  //* Wallet
  "wallet.response.notFound": {
    en: "Wallet not found for this user",
    ar: "المحفظة غير موجودة لهذا المستخدم",
  },
  "wallet.response.empty": {
    en: "Wallet is empty, try to pay without wallet",
    ar: "المحفظة فارغة، حاول الدفع بدون المحفظة",
  },

  //* User Address
  "userAddress.response.notFound": {
    en: "User address not found !",
    ar: "عنوان المستخدم غير موجود !",
  },

  //* Product Length
  "productLength.response.notAvailable": {
    en: "Product length is not available!",
    ar: "طول هذا المنتج غير موجود!",
  },

  //* Payment
  "payment.response.alreadyCompleted": {
    en: "Payment of this order is already completed!",
    ar: "هذا الطلب قد تم دفع تكليفته بالفعل!",
  },
  "payment.response.failed": {
    en: "Payment failed, try again !",
    ar: "فشل الدفع، الرجاء المحاولة مرة أخرى !",
  },
};
