// src/routes/useRouteElements.tsx
import { useRoutes } from "react-router";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import AddProduct from "@/pages/admin/AddProduct";
import EditProduct from "@/pages/admin/EditProduct";
import Categories from "@/pages/admin/Categories";
import Customers from "@/pages/admin/Customers";
import Articles from "@/pages/admin/Articles";
import AddArticle from "@/pages/admin/AddArticle";
import EditArticle from "@/pages/admin/EditArticle";
import ArticleCategories from "@/pages/admin/ArticleCategories";
import Orders from "@/pages/admin/Orders";
import Settings from "@/pages/admin/Settings";
import Analytics from "@/pages/admin/Analytics";
import Brands from "@/pages/admin/Brands";
import Variants from "@/pages/admin/Variants";
import Staffs from "@/pages/admin/Staff";
import Home from "@/pages/user/Home";
import ProductDetail from "@/pages/user/ProductDetail";
import Cart from "@/pages/user/Cart";
import Checkout from "@/pages/user/Checkout";
import Profile from "@/pages/user/Profile";
import Membership from "@/pages/user/Membership";
import PaymentStatus from "@/pages/user/PaymentStatus";
import OrderHistory from "@/pages/user/OrderHistory";
import OrderDetail from "@/pages/user/OrderDetail";
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";
import StaffLayout from "@/layouts/StaffLayout";
import ShipperLayout from "@/layouts/ShipperLayout";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import ShipperDashboard from "@/pages/shipper/ShipperDashboard";
import ShipperOrders from "@/pages/shipper/ShipperOrders";
import {
  ADMIN_PATH,
  AUTH_PATH,
  PUBLIC_PATH,
  STAFF_PATH,
  SHIPPER_PATH,
} from "@/constants/path";
import UserLogin from "@/pages/auth/UserLogin";
import AdminLogin from "@/pages/auth/AdminLogin";
import AuthCallbackComponent from "@/components/auth/AuthCallbackComponent";
import {
  AdminRoute,
  StaffRoute,
  ShipperRoute,
  UserRoute,
} from "@/components/auth/ProtectedRoute";
import RoleBasedRedirect from "@/components/auth/RoleBasedRedirect";
import RoleBasedAuthWrapper from "@/components/auth/RoleBasedAuthWrapper";
import Error401 from "@/pages/error/Error401";
import Promotions from "@/pages/admin/Promotions";
import AddPromotion from "@/pages/admin/AddPromotion";
import EditPromotion from "@/pages/admin/EditPromotion";
import Vouchers from "@/pages/admin/Vouchers";
import VoucherForm from "@/pages/admin/VoucherForm";
import UserRegister from "@/pages/auth/UserRegister";

const useRouteElements = () => {
  return useRoutes([
    {
      path: "/",
      element: <RoleBasedRedirect />,
    },
    {
      path: PUBLIC_PATH.HOME,
      element: (
        <RoleBasedAuthWrapper>
          <UserLayout />
        </RoleBasedAuthWrapper>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: "product/:slug", element: <ProductDetail /> },
        {
          path: "cart",
          element: (
            <UserRoute>
              <Cart />
            </UserRoute>
          ),
        },
        {
          path: "checkout",
          element: (
            <UserRoute>
              <Checkout />
            </UserRoute>
          ),
        },
        {
          path: "payment-status",
          element: <PaymentStatus />,
        },
        {
          path: "orders",
          element: (
            <UserRoute>
              <OrderHistory />
            </UserRoute>
          ),
        },
        {
          path: "orders/:id",
          element: (
            <UserRoute>
              <OrderDetail />
            </UserRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <UserRoute>
              <Profile />
            </UserRoute>
          ),
          children: [
            {
              path: "membership",
              element: <Membership />,
            },
          ],
        },
      ],
    },

    // Auth routes
    {
      path: AUTH_PATH.LOGIN_USER,
      element: (
        <RoleBasedAuthWrapper>
          <UserLogin />
        </RoleBasedAuthWrapper>
      ),
    },
    {
      path: AUTH_PATH.REGISTER_USER,
      element: (
        <RoleBasedAuthWrapper>
          <UserRegister />
        </RoleBasedAuthWrapper>
      ),
    },
    {
      path: AUTH_PATH.LOGIN_ADMIN,
      element: (
        <RoleBasedAuthWrapper>
          <AdminLogin />
        </RoleBasedAuthWrapper>
      ),
    },
    {
      path: AUTH_PATH.GOOGLE_CALLBACK,
      element: <AuthCallbackComponent />,
    },

    // Admin routes (chỉ admin mới truy cập được)
    {
      path: ADMIN_PATH.DASHBOARD,
      element: (
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      ),
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
        { path: ADMIN_PATH.STAFFS, element: <Staffs /> },
        { path: ADMIN_PATH.PROMOTIONS, element: <Promotions /> },
        { path: ADMIN_PATH.PROMOTION_ADD, element: <AddPromotion /> },
        { path: "/admin/promotions/edit/:id", element: <EditPromotion /> },
        { path: ADMIN_PATH.VOUCHERS, element: <Vouchers /> },
        { path: "/admin/vouchers/create", element: <VoucherForm /> },
        { path: "/admin/vouchers/edit/:id", element: <VoucherForm /> },
        { path: ADMIN_PATH.PROMOTIONS, element: <Promotions /> },
        { path: ADMIN_PATH.ARTICLES, element: <Articles /> },
        { path: ADMIN_PATH.ARTICLE_ADD, element: <AddArticle /> },
        { path: "/admin/articles/edit/:id", element: <EditArticle /> },
        { path: ADMIN_PATH.ARTICLE_CATEGORIES, element: <ArticleCategories /> },
      ],
    },

    // Staff routes (admin và staff có thể truy cập)
    {
      path: STAFF_PATH.DASHBOARD,
      element: (
        <StaffRoute>
          <StaffLayout />
        </StaffRoute>
      ),
      children: [
        { index: true, element: <StaffDashboard /> },
        { path: STAFF_PATH.PRODUCTS, element: <Products /> },
        { path: STAFF_PATH.ORDERS, element: <Orders /> },
        { path: STAFF_PATH.CUSTOMERS, element: <Customers /> },
      ],
    },

    // Shipper routes (chỉ shipper mới truy cập được)
    {
      path: SHIPPER_PATH.DASHBOARD,
      element: (
        <ShipperRoute>
          <ShipperLayout />
        </ShipperRoute>
      ),
      children: [
        { index: true, element: <ShipperDashboard /> },
        { path: SHIPPER_PATH.ORDERS, element: <ShipperOrders /> },
        { path: SHIPPER_PATH.DELIVERIES, element: <ShipperOrders /> },
      ],
    },
    {
      path: "/error-401",
      element: <Error401 />,
    },
    {
      path: "*",
      element: <Home />,
    },
  ]);
};

export default useRouteElements;
