
import { useRoutes } from "react-router";
import { AUTH_PATH, ADMIN_PATH } from "../constants/path";

// Admin pages (các trang thực sự tồn tại)
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import Categories from "../pages/admin/Categories";
import Customers from "../pages/admin/Customers";
import Orders from "../pages/admin/Orders";
import Settings from "../pages/admin/Settings";
import Analytics from "../pages/admin/Analytics";

// Layout components
import AdminLayout from "../layouts/AdminLayout";

const useRouteElements = () => {
  return useRoutes([
    // Public routes
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/login",
      element: <Dashboard />, // Tạm thời redirect về Dashboard
    },

    // Admin routes
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "",
          element: <Dashboard />,
        },
        {
          path: "products",
          element: <Products />,
        },
        {
          path: "categories",
          element: <Categories />,
        },
        {
          path: "customers",
          element: <Customers />,
        },
        {
          path: "orders",
          element: <Orders />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "analytics",
          element: <Analytics />,
        },
      ],
    },

    // Fallback route
    {
      path: "*",
      element: <Dashboard />,
    },
  ]);
};

export default useRouteElements;
