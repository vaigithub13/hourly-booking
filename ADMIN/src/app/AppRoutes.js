import { lazy } from "react";

import AuthGuard from "./auth/AuthGuard";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import AdminRoutes from "./views/admin/AdminRoutes"; // Import AdminRoutes
import useAuth from "./hooks/useAuth"; // Ensure this is at the top
import { Navigate } from "react-router-dom";
import VendorRoutes from "./views/vendor/VendorRoutes";

// SESSION PAGES
const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtLoginCopy = Loadable(lazy(() => import("app/views/sessions/JwtLogin_Copy")));
const JwtRegister = Loadable(lazy(() => import("app/views/sessions/JwtRegister")));
const JWTRegisterCopy = Loadable(lazy(() => import("app/views/sessions/JWTRegisterCopy")));
const ForgotPassword = Loadable(lazy(() => import("app/views/sessions/ForgotPassword")));
const ServerDown = Loadable(lazy(() => import("app/views/sessions/ServerDown")));

//guest
const GuestPolicy = Loadable(lazy(() => import("app/views/guest/privacy-policy")));
const GuestTermsAndConditions = Loadable(
  lazy(() => import("app/views/guest/terms-and-conditions"))
);

const AppRoutes = () => {
  const { user } = useAuth();

  return [
    {
      path: "/",
      element: (
        <Navigate
          to={
            user?.role === "admin"
              ? "dashboard/admin/statistics"
              : user?.role === "vendor"
              ? "dashboard/vendor/statistics"
              : "/session/signin"
          }
        />
      )
    },
    {
      element: (
        <AuthGuard>
          <MatxLayout />
        </AuthGuard>
      ),
      children:
        user?.role === "admin" ? [...AdminRoutes] : user?.role === "vendor" ? [...VendorRoutes] : []
    },

    // Session pages route
    { path: "/session/404", element: <NotFound /> },
    { path: "/session/signin", element: <JwtLoginCopy /> },
    { path: "/session/signup", element: <JWTRegisterCopy /> },
    { path: "/session/forgot-password", element: <ForgotPassword /> },
    { path: "/500", element: <ServerDown /> },
    { path: "*", element: <NotFound /> },
    // guest routes
    { path: "/privacy-policy", element: <GuestPolicy /> },
    { path: "/terms-and-conditions", element: <GuestTermsAndConditions /> }
  ];
};

export default AppRoutes;
