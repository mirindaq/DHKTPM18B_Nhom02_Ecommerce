
import { useRoutes } from "react-router";

// Admin pages (các trang thực sự tồn tại)
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Categories from "@/pages/admin/Categories";
import Customers from "@/pages/admin/Customers";
import Orders from "@/pages/admin/Orders";
import Settings from "@/pages/admin/Settings";
import Analytics from "@/pages/admin/Analytics";

// Layout components
import AdminLayout from "@/layouts/AdminLayout";
import Brands from "@/pages/admin/Brands";
import { ADMIN_PATH, AUTH_PATH, PUBLIC_PATH } from "@/constants/path";
import Variants from "@/pages/admin/Variants";

const useRouteElements = () => {
  return useRoutes([
    // Public routes
    {
      path: PUBLIC_PATH.HOME,
      element: <Dashboard />,
    },
    {
      path: AUTH_PATH.LOGIN_USER,
      element: <Dashboard />, // Tạm thời redirect về Dashboard
    },

    // Admin routes
    {
      path: ADMIN_PATH.DASHBOARD,
      element: <AdminLayout />,
      children: [
        {
          path: ADMIN_PATH.DASHBOARD,
          element: <Dashboard />,
        },
        {
          path: ADMIN_PATH.PRODUCTS,
          element: <Products />,
        },
        {
          path: ADMIN_PATH.VARIANTS,
          element: <Variants />,
        },
        {
          path: ADMIN_PATH.CATEGORIES,
          element: <Categories />,
        },
        {
          path: ADMIN_PATH.BRANDS,
          element: <Brands />,
        },
        {
          path: ADMIN_PATH.CUSTOMERS,
          element: <Customers />,
        },
        {
          path: ADMIN_PATH.ORDERS,
          element: <Orders />,
        },
        {
          path: ADMIN_PATH.SETTINGS,
          element: <Settings />,
        },
        {
          path: ADMIN_PATH.ANALYTICS,
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
