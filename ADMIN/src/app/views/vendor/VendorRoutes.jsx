import { lazy } from 'react'
import Loadable from 'app/components/Loadable'

const Dashboard = Loadable(lazy(() => import('./dashboard/Analytics')))

const Products = Loadable(lazy(() => import('./products/list')))
const AddProduct = Loadable(lazy(() => import('./products/create')))
const ProductDetails = Loadable(lazy(() => import('./products/Details')))
const EditProduct = Loadable(lazy(() => import('./products/edit')))
//orders
const Orders = Loadable(lazy(() => import('./orders/orders')))
const OrderDetails = Loadable(lazy(() => import('./orders/details')))
//returns
const Returns = Loadable(lazy(() => import('./returns/list')))
const ReturnDetails = Loadable(lazy(() => import('./returns/details')))
//transactions
const Transactions = Loadable(lazy(() => import('./transactions/list')))
//accounting
const Accounting = Loadable(lazy(() => import('./accounting/list')))
//profile
const Profile = Loadable(lazy(() => import('./profile/details')))
//edit
const Edit = Loadable(lazy(() => import('./profile/edit')))

const VendorRoutes = [
  //dashboard
  { path: '/dashboard/vendor/statistics', element: <Dashboard /> },
  //products
  { path: '/dashboard/vendor/products', element: <Products /> },
  { path: '/dashboard/vendor/products/create', element: <AddProduct /> },
  {
    path: '/dashboard/vendor/products/:id/details',
    element: <ProductDetails />,
  },
  //orders
  { path: '/dashboard/vendor/orders', element: <Orders /> },
  { path: '/dashboard/vendor/orders/:id/details', element: <OrderDetails /> },
  //returns
  { path: '/dashboard/vendor/returns', element: <Returns /> },
  { path: '/dashboard/vendor/returns/:id/details', element: <ReturnDetails /> },
  //products
  { path: '/dashboard/vendor/products/:id/edit', element: <EditProduct /> },
  //transactions
  { path: '/dashboard/vendor/transactions', element: <Transactions /> },
  //accounting
  { path: '/dashboard/vendor/accounting', element: <Accounting /> },
  //profile
  { path: '/dashboard/vendor/:id/profile', element: <Profile /> },
  //edit
  { path: '/dashboard/vendor/:id/edit', element: <Edit /> },
]

export default VendorRoutes
