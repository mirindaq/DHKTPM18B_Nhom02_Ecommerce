// src/routes/useRouteElements.tsx
import { useRoutes } from "react-router"

// ======================= ADMIN PAGES =======================
import Dashboard from "@/pages/admin/Dashboard"
import Products from "@/pages/admin/Products"
import AddProduct from "@/pages/admin/AddProduct"
import EditProduct from "@/pages/admin/EditProduct"
import Categories from "@/pages/admin/Categories"
import Customers from "@/pages/admin/Customers"
import Orders from "@/pages/admin/Orders"
import Settings from "@/pages/admin/Settings"
import Analytics from "@/pages/admin/Analytics"
import Brands from "@/pages/admin/Brands"
import Variants from "@/pages/admin/Variants"
import Staffs from "@/pages/admin/Staff"

<<<<<<< HEAD
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import AddProduct from "@/pages/admin/AddProduct";
import EditProduct from "@/pages/admin/EditProduct";
import Categories from "@/pages/admin/Categories";
import Customers from "@/pages/admin/Customers";
import Orders from "@/pages/admin/Orders";
import Settings from "@/pages/admin/Settings";
import Analytics from "@/pages/admin/Analytics";
import AdminLogin from "@/pages/auth/AdminLogin";

// Layout components
import AdminLayout from "@/layouts/AdminLayout";
import Brands from "@/pages/admin/Brands";
import { ADMIN_PATH, AUTH_PATH, PUBLIC_PATH } from "@/constants/path";
import Variants from "@/pages/admin/Variants";
import Staffs from "@/pages/admin/Staff";
import AuthCallbackComponent from "@/components/auth/AuthCallbackComponent";

const useRouteElements = () => {
  return useRoutes([
    // Auth routes
    {
      path: AUTH_PATH.LOGIN_ADMIN,
      element: <AdminLogin />,
    },
    {
      path: AUTH_PATH.LOGIN_USER,
      element: <Dashboard />, // Tạm thời redirect về Dashboard
=======
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
>>>>>>> c05d84d9badff0f3430c1ac3ea03e9ce7412a81d
    },
    
    // Public routes
    {
      path: PUBLIC_PATH.HOME,
      element: <Dashboard />,
    },

    // ======================= ADMIN ROUTES =======================
    {
      path: ADMIN_PATH.DASHBOARD,
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: ADMIN_PATH.PRODUCTS, element: <Products /> },
        { path: ADMIN_PATH.PRODUCT_ADD, element: <AddProduct /> },
        { path: "/admin/products/edit/:id", element: <EditProduct /> },
        { path: ADMIN_PATH.VARIANTS, element: <Variants /> },
        { path: ADMIN_PATH.CATEGORIES, element: <Categories /> },
        { path: ADMIN_PATH.BRANDS, element: <Brands /> },
        { path: ADMIN_PATH.CUSTOMERS, element: <Customers /> },
        { path: ADMIN_PATH.ORDERS, element: <Orders /> },
        { path: ADMIN_PATH.SETTINGS, element: <Settings /> },
        { path: ADMIN_PATH.ANALYTICS, element: <Analytics /> },
        { path: ADMIN_PATH.STAFFS, element: <Staffs /> }
      ]
    },

<<<<<<< HEAD
    {
      path: AUTH_PATH.GOOGLE_CALLBACK,
      element: <AuthCallbackComponent />,
    },

    // Fallback route
=======
    // ======================= AUTH ROUTES =======================
    // {
    //   path: AUTH_PATH.LOGIN_ADMIN,
    //   element: <LoginAdmin />
    // },

    // ======================= FALLBACK =======================
>>>>>>> c05d84d9badff0f3430c1ac3ea03e9ce7412a81d
    {
      path: "*",
      element: <Home />
    }
  ])
}

export default useRouteElements
