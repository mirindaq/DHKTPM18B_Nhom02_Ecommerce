// src/routes/useRouteElements.jsx
import { useRoutes } from "react-router"

// ======================= ADMIN PAGES =======================
import Dashboard from "@/pages/admin/Dashboard"
import Products from "@/pages/admin/Products"
import Categories from "@/pages/admin/Categories"
import Customers from "@/pages/admin/Customers"
import Orders from "@/pages/admin/Orders"
import Settings from "@/pages/admin/Settings"
import Analytics from "@/pages/admin/Analytics"
import Brands from "@/pages/admin/Brands"
import Variants from "@/pages/admin/Variants"

// ======================= USER PAGES =======================
import Home from "@/pages/user/Home"
import ProductDetail from "@/pages/user/ProductDetail"
import Cart from "@/pages/user/Cart"
import Profile from "@/pages/user/Profile"

// ======================= AUTH PAGES =======================
// import LoginUser from "@/pages/auth/LoginUser"
// import LoginAdmin from "@/pages/auth/LoginAdmin"

// ======================= LAYOUTS =======================
import AdminLayout from "@/layouts/AdminLayout"
import UserLayout from "@/layouts/UserLayout"

// ======================= CONSTANTS =======================
import { ADMIN_PATH, AUTH_PATH, PUBLIC_PATH } from "@/constants/path"

const useRouteElements = () => {
  return useRoutes([
    // ======================= USER ROUTES =======================
    {
      path: PUBLIC_PATH.HOME,
      element: <UserLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "product/:id", element: <ProductDetail /> },
        { path: "cart", element: <Cart /> },
        { path: "profile", element: <Profile /> },
        // { path: AUTH_PATH.LOGIN_USER, element: <LoginUser /> }
      ]
    },

    // ======================= ADMIN ROUTES =======================
    {
      path: ADMIN_PATH.DASHBOARD,
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: ADMIN_PATH.PRODUCTS, element: <Products /> },
        { path: ADMIN_PATH.VARIANTS, element: <Variants /> },
        { path: ADMIN_PATH.CATEGORIES, element: <Categories /> },
        { path: ADMIN_PATH.BRANDS, element: <Brands /> },
        { path: ADMIN_PATH.CUSTOMERS, element: <Customers /> },
        { path: ADMIN_PATH.ORDERS, element: <Orders /> },
        { path: ADMIN_PATH.SETTINGS, element: <Settings /> },
        { path: ADMIN_PATH.ANALYTICS, element: <Analytics /> }
      ]
    },

    // ======================= AUTH ROUTES =======================
    // {
    //   path: AUTH_PATH.LOGIN_ADMIN,
    //   element: <LoginAdmin />
    // },

    // ======================= FALLBACK =======================
    {
      path: "*",
      element: <Home />
    }
  ])
}

export default useRouteElements
