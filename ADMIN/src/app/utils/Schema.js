import * as Yup from "yup";

const nameOnly = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
const numsName = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/;
const nameNums = /^[0-9]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/;
const arabic =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.,!؟0-9\u0660-\u0669\u06F0-\u06F9\%]+$/;
const arabicRegex =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.,!؟0-9\u0660-\u0669\u06F0-\u06F9%@\-()/:]+$/;

export const BannerSchema = Yup.object().shape({
  title: Yup.object().shape({
    en: Yup.string()
      .transform((value) => value.trim())
      .required("Title in english is required")
      .matches(nameOnly, "Special characters, numbers are not allowed")
      .min(3, "Must have at least 3 characters")
      .max(30, " Must be at most 30 characters"),
    ar: Yup.string()
      .transform((value) => value.trim())

      .required("العنوان باللغة العربية مطلوب")
      .matches(arabicRegex, "إدخال غير صحيح")
  }),

  url: Yup.string()
    .transform((value) => value.trim())

    .url("Invalid URL format"),
  image: Yup.mixed().nullable().required("Image is required")
});

export const VendorSchemas = (currentVendor = null, isVendor = false, isAdmin = false) => [
  // Step 1 Schema
  Yup.object().shape({
    logo: Yup.string().nullable().required("Logo is required"),
    vendorName: Yup.object().shape({
      en: Yup.string()
        .required("Name is required")
        .matches(nameOnly, "Special characters and numbers are not allowed")
        .min(3, "Must have at least 3 characters")
        .max(30, "Full Name must be at most 30 characters"),
      ar: Yup.string()
        .required("الاسم مطلوب")
        .matches(arabic, "مطلوب الحروف العربية فقط")
        .min(3, "يجب أن تحتوي على 3 أحرف على الأقل")
        .max(30, "يجب أن يكون الاسم الكامل 30 حرفًا على الأكثر")
    })
  }),

  // Step 2 Schema
  Yup.object().shape({
    ownerName: Yup.object().shape({
      en: Yup.string()
        .required("Brand Name is required")
        .matches(nameOnly, "Special characters and numbers are not allowed")
        .min(3, "Must have at least 3 characters")
        .max(30, "Full Name must be at most 30 characters"),
      ar: Yup.string()
        .required("اسم العلامة التجارية مطلوب")
        .matches(arabic, "مطلوب الحروف العربية فقط")
        .min(3, "يجب أن تحتوي على 3 أحرف على الأقل")
        .max(30, "يجب أن يكون الاسم الكامل 30 حرفًا على الأكثر")
    }),
    password: !currentVendor
      ? Yup.string().min(8, "Password must be 8 character length").required("Password is required!")
      : Yup.string().notRequired(),
    email: Yup.string().required("Email is required!").email("Invalid Email address"),
    username: Yup.string().required("Username is required"),
    phoneNumber: Yup.string().required("Phone number is required").min(8, "Should have 8 digits")
  }),

  // Step 3 Schema
  Yup.object().shape({
    address: Yup.object().shape({
      unit: Yup.string().required("Unit is required"),
      zone: Yup.string().required("Zone is required"),
      building: Yup.string().required("Building is required"),
      street: Yup.string().required("Street is required")
    })
  }),

  // Step 4 Schema
  Yup.object().shape({
    appPercentage: Yup.number().min(0, "Must be 0 or more").max(99999, "Invalid input"),
    certificate: Yup.string().nullable().required("Certificate is required"),
    isCheck: Yup.bool().when([], {
      is: () => !isAdmin && !isVendor, // Apply validation only if isAdmin is true
      then: (schema) => schema.oneOf([true], "You must accept the Terms & Conditions"),
      otherwise: (schema) => schema.notRequired() // Not required if isAdmin is false
    })
  })
];

export const CategorySchema = Yup.object().shape({
  name: Yup.object().shape({
    en: Yup.string()
      .required("English name is required")
      .matches(nameOnly, "please enter valid name"),
    ar: Yup.string().required("الوصف العربي مطلوب").matches(arabicRegex, "إدخال غير صحيح")
  }),
  image: Yup.mixed().nullable().required("Image is required")
});

export const AttributeSchema = Yup.object().shape({
  type: Yup.string().required("Type is required"),

  name: Yup.lazy((_, { parent }) => {
    const isLength = parent.type === "length";

    return Yup.object().shape({
      en: Yup.string()
        .required(isLength ? "Length is required" : "English name is required")
        .matches(
          isLength ? nameNums : nameOnly,
          isLength
            ? "Please enter valid length name (numbers allowed)"
            : "Please enter valid name (only letters allowed)"
        ),
      ar: isLength
        ? Yup.string().notRequired()
        : Yup.string().required("الاسم مطلوب").matches(arabicRegex, "إدخال غير صحيح")
    });
  })
});

export const ProductSchema = (isAdmin = false, isLength = false, isReady = false) => [
  // Step 1
  Yup.object().shape({
    name: Yup.object().shape({
      en: Yup.string()
        .matches(numsName, "Enter valid product name")
        .required("Product name is required"),
      ar: Yup.string().matches(arabicRegex, "إدخال غير صحيح").required("اسم المنتج مطلوب")
    }),
    etaDays: !isReady
      ? Yup.number()
          .typeError("Must be a number")
          .required("ETA Days is required")
          .positive("ETA Days is required")
      : Yup.number().notRequired(),
    description: Yup.object().shape({
      en: Yup.string().required("Description is required"),
      ar: Yup.string().matches(arabicRegex, "إدخال غير صحيح").required("الوصف مطلوب")
    })
  }),

  // Step 2
  Yup.object().shape({
    price: Yup.number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .positive("Enter valid price")
      .required("Price is required"),
    discountedPrice: Yup.number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .notRequired()
      .test(
        "is-less-than-price",
        "Discounted price must be less than the price",
        function (discountedPrice) {
          const price = this.parent.price;
          if (discountedPrice === undefined || price === undefined) return true;
          return discountedPrice < price;
        }
      ),
    vendorId: isAdmin
      ? Yup.object()
          .nullable()
          .required("Please select a designer")
          .test("valid-designer", "Please select a designer", (value) => !!value && !!value.id)
      : Yup.string().nullable().notRequired(),
    categoriesIds: Yup.array().min(1, "Choose at least one option")
  }),

  // Step 3 - Conditional on readyToShip
  isReady
    ? Yup.object().shape({
        sizesAndColors: Yup.array().of(
          Yup.object().shape({
            colorId: Yup.number().nullable().required("Please select a color"),
            sizeId: Yup.number().nullable().required("Please select a size"),
            lengthId: !isLength
              ? Yup.number().nullable().required("Please select a length")
              : Yup.number().nullable().notRequired(),
            amount: Yup.number()
              .typeError("quantity must be a number")
              .min(0, "must be equal to or greater than 0")
          })
        )
      })
    : Yup.object().shape({
        supportedCustomAttributes: Yup.array()
          .of(Yup.number())
          .min(1, "Please select at least one color")
      }),

  // Step 4
  Yup.object().shape({
    mainImage: Yup.mixed().nullable().required("Main Image is required")
  })
];

export const SettingsSchema = Yup.object().shape({
  supportEmail: Yup.string()
    .transform((value) => value.trim())
    .email("Invalid email address")
    .required("Email is required"),
  eventsReceivingEmail: Yup.string()
    .transform((value) => value.trim())
    .email("Invalid email address")
    .required("Email is required"),
  whatsappNumber: Yup.string()
    .transform((value) => value.trim())
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(8, "Phone number must be exactly 8 digits"),
  deliveryPricing: Yup.object().shape({
    insideDoha: Yup.string()
      .matches(/^\d+$/, "must contain only numbers")
      .min(0, "Min should be 0")
      .max(9999, "Max should be 4 digits"),
    outsideDoha: Yup.string()
      .matches(/^\d+$/, "must contain only numbers")
      .min(0, "Min should be 0")
      .max(9999, "Max should be 4 digits")
  })
  // walletRefundTimeInMinutes: Yup.number().positive("Please enter valid digit")
  // homePageText: Yup.object().shape({
  //   en: Yup.string().required("field is required"),
  //   ar: Yup.string().required("field is required").matches(arabicRegex, "العربية فقط")
  // })
});

export const LengthSchema = Yup.object().shape({
  length: Yup.number().positive("Required & should be more than zero")
});

export const SizeGuideSchema = Yup.object().shape({
  sizeGuide: Yup.array().of(
    Yup.object().shape({
      sizeName: Yup.object().shape({
        en: Yup.string().required("Required"),
        ar: Yup.string().required("مطلوب")
      }),
      bodyParts: Yup.array().of(
        Yup.object().shape({
          name: Yup.object().shape({
            en: Yup.string().required("Required"),
            ar: Yup.string().required("مطلوب")
          }),
          measurements: Yup.object().shape({
            cm: Yup.number().positive("Must be positive").required("Required"),
            inch: Yup.number().positive("Must be positive").required("Required")
          })
        })
      )
    })
  )
});

export const NotificationSchema = Yup.object().shape({
  title: Yup.object().shape({
    en: Yup.string()
      .transform((value) => value.trim())
      .required("Title in English is required"),
    ar: Yup.string().required("العنوان باللغة العربية مطلوب").matches(arabicRegex, "إدخال غير صحيح")
  }),

  content: Yup.object().shape({
    en: Yup.string()
      .transform((value) => value.trim())
      .required("Content in English is required")
      .max(100, "Maximum 100 characters are allowed"),
    ar: Yup.string()
      .transform((value) => value.trim())

      .required("المحتوى باللغة العربية مطلوب")
      .matches(arabicRegex, "إدخال غير صحيح")
  })
});

export const RefundSchema = (orderValue) =>
  Yup.object().shape({
    walletRefundValue: Yup.number()
      .nullable()
      .max(orderValue, `Refund must be ≤ order value (${orderValue})`)
  });

export const TipsSchema = Yup.object().shape({
  fabricCare: Yup.array()
    .of(
      Yup.object().shape({
        key: Yup.object().shape({
          en: Yup.string().required("Fabric title is required"),
          ar: Yup.string().required("عنوان القماش مطلوب").matches(arabicRegex, "إدخال غير صحيح")
        }),
        values: Yup.array()
          .of(
            Yup.object().shape({
              en: Yup.string().required("Fabric description is required"),
              ar: Yup.string().required("مطلوب وصف النسيج").matches(arabicRegex, "إدخال غير صحيح")
            })
          )
          .min(1, "At least one fabric description is required")
          .required("Fabric descriptions are required")
      })
    )
    .min(1, "At least one fabric care entry is required")
    .required("Fabric care is required"),

  washingMethods: Yup.array()
    .of(
      Yup.object().shape({
        key: Yup.object().shape({
          en: Yup.string().required("Washing title is required"),
          ar: Yup.string().required("عنوان الغسيل مطلوب").matches(arabicRegex, "إدخال غير صحيح")
        }),
        values: Yup.array()
          .of(
            Yup.object().shape({
              en: Yup.string().required("Washing description is required"),
              ar: Yup.string().required("وصف الغسيل مطلوب").matches(arabicRegex, "إدخال غير صحيح")
            })
          )
          .min(1, "At least one washing description is required")
          .required("Washing descriptions are required")
      })
    )
    .min(1, "At least one washing method is required")
    .required("Washing methods are required")
});
