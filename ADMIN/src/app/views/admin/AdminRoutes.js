import { lazy } from "react";
import Loadable from "app/components/Loadable";

const Dashboard = Loadable(lazy(() => import("./dashboard/Analytics")));
const Users = Loadable(lazy(() => import("./users/list")));

const Vendors = Loadable(lazy(() => import("./vendors/list")));
const Profile = Loadable(lazy(() => import("./vendors/profile")));
const Edit = Loadable(lazy(() => import("./vendors/edit")));
const Create = Loadable(lazy(() => import("./vendors/create")));

const Orders = Loadable(lazy(() => import("./orders/orders")));
const OrderDetails = Loadable(lazy(() => import("./orders/orderDetails")));

const Requests = Loadable(lazy(() => import("./requests/list")));
const ReturnRequests = Loadable(lazy(() => import("./requests/returnRequests")));

const Returns = Loadable(lazy(() => import("./returns/list")));
const ReturnDetails = Loadable(lazy(() => import("./returns/details")));

const Categories = Loadable(lazy(() => import("./categories/list")));
const Attributes = Loadable(lazy(() => import("./attributes/list")));

const Banners = Loadable(lazy(() => import("./banners/list")));
const AddBanner = Loadable(lazy(() => import("./banners/create")));
const EditBanner = Loadable(lazy(() => import("./banners/edit")));

const Locations = Loadable(lazy(() => import("./delivery/list")));
const AddLocation = Loadable(lazy(() => import("./delivery/create")));
const EditLocation = Loadable(lazy(() => import("./delivery/edit")));

const Products = Loadable(lazy(() => import("./products/list")));
const AddProducts = Loadable(lazy(() => import("./products/create")));
const EditProduct = Loadable(lazy(() => import("./products/edit")));
const ProductDetails = Loadable(lazy(() => import("./products/Details")));

const Accounting = Loadable(lazy(() => import("./accounting/list")));
const Transactions = Loadable(lazy(() => import("./accounting/transactions")));

const Config = Loadable(lazy(() => import("./configuration/setting")));
const UpdateConfig = Loadable(lazy(() => import("./configuration/update")));

const PrivacyPolicy = Loadable(lazy(() => import("./privacy-policy/policy")));
const EditPolicy = Loadable(lazy(() => import("./privacy-policy/Update-policy")));

const TermsAndConditions = Loadable(lazy(() => import("./terms-and-conditions/T&C")));
const EditTermsAndConditions = Loadable(lazy(() => import("./terms-and-conditions/update")));

const Faqs = Loadable(lazy(() => import("./faqs/list")));
const Lengths = Loadable(lazy(() => import("./lengths/list")));
const SizeGuide = Loadable(lazy(() => import("./size-guide/list")));
const Tips = Loadable(lazy(() => import("./tips/list")));
const Notifications = Loadable(lazy(() => import("./notifications/list")));

const AdminRoutes = [
  //dashboard
  { path: "/dashboard/admin/statistics", element: <Dashboard /> },
  //users
  { path: "/dashboard/admin/users", element: <Users /> },
  //vendors
  { path: "/dashboard/admin/vendors", element: <Vendors /> },
  { path: "/dashboard/admin/vendors/create", element: <Create /> },
  { path: "/dashboard/admin/vendors/:id/profile", element: <Profile /> },
  { path: "/dashboard/admin/vendors/:id/edit", element: <Edit /> },
  //orders
  { path: "/dashboard/admin/orders", element: <Orders /> },
  { path: "/dashboard/admin/orders/:id/details", element: <OrderDetails /> },
  //cancel & return requests
  { path: "/dashboard/admin/cancel-requests", element: <Requests /> },
  { path: "/dashboard/admin/return-requests", element: <ReturnRequests /> },
  //returns
  { path: "/dashboard/admin/returns", element: <Returns /> },
  { path: "/dashboard/admin/returns/:id/details", element: <ReturnDetails /> },
  //products
  { path: "/dashboard/admin/products", element: <Products /> },
  { path: "/dashboard/admin/products/create", element: <AddProducts /> },
  { path: "/dashboard/admin/products/:id/edit", element: <EditProduct /> },
  { path: "/dashboard/admin/products/:id/details", element: <ProductDetails /> },
  //accounting
  { path: "/dashboard/admin/accounting", element: <Accounting /> },
  { path: "/dashboard/admin/accounting/:id/transactions", element: <Transactions /> },
  //categories
  { path: "/dashboard/admin/categories", element: <Categories /> },
  //attributes
  { path: "/dashboard/admin/attributes", element: <Attributes /> },
  //banners
  { path: "/dashboard/admin/banners", element: <Banners /> },
  { path: "/dashboard/admin/banners/create", element: <AddBanner /> },
  { path: "/dashboard/admin/banners/:id/edit", element: <EditBanner /> },
  //locations
  { path: "/dashboard/admin/delivery", element: <Locations /> },
  { path: "/dashboard/admin/delivery/create", element: <AddLocation /> },
  { path: "/dashboard/admin/delivery/edit", element: <EditLocation /> },
  //global settting
  { path: "/dashboard/admin/config", element: <Config /> },
  { path: "/dashboard/admin/config/update", element: <UpdateConfig /> },
  //privacy-policy
  { path: "/dashboard/admin/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/dashboard/admin/privacy-policy/edit", element: <EditPolicy /> },
  //terms-and-condtions
  { path: "/dashboard/admin/terms-and-conditions", element: <TermsAndConditions /> },
  { path: "/dashboard/admin/terms-and-conditions/edit", element: <EditTermsAndConditions /> },
  //Notifications
  { path: "/dashboard/admin/notifications", element: <Notifications /> },
  //lengths
  { path: "/dashboard/admin/lengths", element: <Lengths /> },
  //size-guide
  { path: "/dashboard/admin/size-guide", element: <SizeGuide /> },
  //tips
  { path: "/dashboard/admin/tips", element: <Tips /> },
  //faqs
  { path: "/dashboard/admin/faqs", element: <Faqs /> }
];

export default AdminRoutes;
