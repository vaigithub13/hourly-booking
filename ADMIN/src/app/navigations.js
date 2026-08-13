export const navigations = [
  { name: "Dashboard", path: "dashboard/admin/statistics", icon: "dashboard" },
  { label: "User Management", type: "label" },
  {
    name: "Customers",
    icon: "group",
    path: "dashboard/admin/users/",
    iconText: "U"
  },

  { label: "Designers Management", type: "label" },
  {
    name: "Designers",
    icon: "group_add",
    path: "dashboard/admin/vendors/",
    iconText: "U"
  },
  { name: "Orders", path: "/dashboard/admin/orders", icon: "shopping_cart", iconText: "O" },
  { name: "Return Orders", path: "/dashboard/admin/returns", icon: "remove_shopping_cart" },
  { name: "Products", path: "/dashboard/admin/products", icon: "shopping_basket", iconText: "P" },

  { label: "Refunds requests", type: "label" },
  { name: "Cancel", path: "/dashboard/admin/cancel-requests", icon: "feedback" },
  { name: "Return", path: "/dashboard/admin/return-requests", icon: "feedback" },

  { label: "Accounting", type: "label" },

  {
    name: "Accounting",
    icon: "account_balance",
    path: "/dashboard/admin/accounting"
  },

  { label: "Categories & Attributes", type: "label" },
  {
    name: "Categories",
    icon: "lock",
    path: "dashboard/admin/categories/",
    iconText: "U"
  },
  {
    name: "Custom Attributes",
    icon: "loyalty",
    path: "/dashboard/admin/attributes"
  },

  // {
  //   name: "Lengths",
  //   icon: "format_size",
  //   path: "/dashboard/admin/lengths"
  // },

  {
    name: "Size Guide",
    icon: "filter_9_plus",
    path: "/dashboard/admin/size-guide"
  },

  {
    name: "Laundry & Ironing Tips",
    icon: "directions_walk",
    path: "/dashboard/admin/tips"
  },

  { label: "Marketing & Promotions", type: "label" },

  {
    name: "Banners",
    icon: "album",
    path: "/dashboard/admin/banners"
  },

  {
    name: "Notifications",
    icon: "notifications",
    path: "/dashboard/admin/notifications"
  },

  { label: "APP SETTINGS", type: "label" },
  // {
  //   name: "Delivery Fee",
  //   icon: "local_shipping",
  //   path: "/dashboard/admin/delivery"
  // },

  {
    name: "Global Settings",
    icon: "settings",
    path: "/dashboard/admin/config"
  },

  {
    name: `FAQ's`,
    icon: "event",
    path: "/dashboard/admin/faqs"
  },
  {
    name: `Privacy Policy`,
    icon: "security",
    path: "/dashboard/admin/privacy-policy"
  },
  {
    name: "Terms & Conditions",
    icon: "edit",
    path: "/dashboard/admin/terms-and-conditions"
  }
];

export const VendorNavigation = [
  { name: "Dashboard", path: "dashboard/vendor/statistics", icon: "dashboard" },

  { label: "Orders Management", type: "label" },

  { name: "Orders", path: "/dashboard/vendor/orders", icon: "shopping_cart", iconText: "O" },

  { name: "Return Requests", path: "/dashboard/vendor/returns", icon: "remove_shopping_cart" },

  { label: "Products Management", type: "label" },

  { name: "Products", path: "/dashboard/vendor/products", icon: "shopping_basket", iconText: "P" },

  { label: "Accounting", type: "label" },
  {
    name: "Accounting",
    icon: "account_balance",
    path: "/dashboard/vendor/accounting"
  },

  { label: "Transactions", type: "label" },
  { name: "Transactions", path: "/dashboard/vendor/transactions", icon: "account_balance_wallet" }
];
