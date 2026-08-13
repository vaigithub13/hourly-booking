import { lazy } from "react";

import AuthGuard from "./auth/AuthGuard";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import AdminRoutes from "./views/admin/AdminRoutes";
import { Navigate } from "react-router-dom";

// SESSION PAGES
const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtLoginCopy = Loadable(lazy(() => import("app/views/sessions/JwtLogin_Copy")));
const JwtRegister = Loadable(lazy(() => import("app/views/sessions/JwtRegister")));
const ForgotPasswordCpy = Loadable(lazy(() => import("app/views/sessions/ForgotPasswordCpy")));

const routes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [...AdminRoutes]
  },

  // session pages route
  { path: "/session/404", element: <NotFound /> },
  { path: "/session/signin", element: <JwtLoginCopy /> },
  { path: "/session/signup", element: <JwtRegister /> },
  { path: "/session/forgot-password", element: <ForgotPasswordCpy /> },

  { path: "/", element: <Navigate to="dashboard/admin/statistics" /> },
  { path: "*", element: <NotFound /> }
];

export default routes;
