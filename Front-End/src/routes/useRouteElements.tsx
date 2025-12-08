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
import VoucherAnalytics from "@/pages/admin/VoucherAnalytics";
import PromotionAnalytics from "@/pages/admin/PromotionAnalytics";
import Brands from "@/pages/admin/Brands";
import Variants from "@/pages/admin/Variants";
import Staffs from "@/pages/admin/Staff";
import Home from "@/pages/user/Home";
import ProductDetail from "@/pages/user/ProductDetail";
import ProductReviews from "@/pages/user/ProductReviews";
import Cart from "@/pages/user/Cart";
import Checkout from "@/pages/user/Checkout";
import Profile from "@/pages/user/Profile";
import Membership from "@/pages/user/Membership";
import PaymentStatus from "@/pages/user/PaymentStatus";
import OrderHistory from "@/pages/user/OrderHistory";
import OrderDetail from "@/pages/user/OrderDetail";
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
import Vouchers from "@/pages/admin/Vouchers";
import VoucherForm from "@/pages/admin/VoucherForm";
import UserRegister from "@/pages/auth/UserRegister";
import News from "@/pages/user/News";
import NewsDetail from "@/pages/user/NewsDetail";
import NewsCategory from "@/pages/user/NewsCategory";
import ArticleSearch from "@/pages/user/ArticleSearch";
import SearchWithCategory from "@/pages/user/SearchWithCategory";
import Search from "@/pages/user/Search";
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";
import StaffLayout from "@/layouts/StaffLayout";
import ShipperLayout from "@/layouts/ShipperLayout";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import StaffAssignDelivery from "@/pages/staff/StaffAssignDelivery";
import ShipperDashboard from "@/pages/shipper/ShipperDashboard";
import Deliveries from "@/pages/shipper/Deliveries";
import CategoryAssignmentPage from "@/pages/admin/CategoryAssignment";
import Carts from "@/pages/admin/Carts";
import FilterCriterias from "@/pages/admin/FilterCriterias";
import Address from "@/pages/user/Address";
import MyWishlist from "@/pages/user/MyWishlist";
import CustomerChat from "@/pages/user/CustomerChat";
import MyVouchers from "@/pages/user/MyVouchers";
import EditProfile from "@/pages/user/EditProfile";
import GuaranteePolicy from "@/pages/user/GuaranteePolicy";
import TermsOfUse from "@/pages/user/TermsOfUse";
import WarrantyPolicy from "@/pages/user/WarrantyPolicy";
import ChatManagement from "@/pages/admin/ChatManagement";
import StaffLogin from "@/pages/auth/StaffLogin";
import ShipperLogin from "@/pages/auth/ShipperLogin";
import Feedbacks from "@/pages/admin/Feedbacks";
import AdminProductQuestionsPage from "@/pages/admin/ProductQuestionsPage";
import {
  ADMIN_PATH,
  AUTH_PATH,
  PUBLIC_PATH,
  STAFF_PATH,
  SHIPPER_PATH,
} from "@/constants/path";
import EditPromotion from "@/pages/admin/EditPromotion";
import AddPromotion from "@/pages/admin/AddPromotion";
import PurchaseOrders from "@/pages/admin/PurchaseOrders";
import AddPurchaseOrder from "@/pages/admin/AddPurchaseOrder";
import PurchaseOrderDetail from "@/pages/admin/PurchaseOrderDetail";
import Banners from "@/pages/admin/Banner";
import StaffSell from "@/pages/staff/StaffSell";
import StaffPaymentStatus from "@/pages/staff/StaffPaymentStatus";
import Suppliers from "@/pages/admin/Suppliers";

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
        { path: "product/:slug/reviews", element: <ProductReviews /> },
        { path: "search/:slug", element: <SearchWithCategory /> },
        { path: "search", element: <Search /> },
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
          path: "chat",
          element: (
            <UserRoute>
              <CustomerChat />
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
            { path: "addresses", element: <Address /> },
            { path: "wishlist", element: <MyWishlist /> },
            { path: "orders", element: <OrderHistory /> },
            { path: "orders/:id", element: <OrderDetail /> },
            { path: "vouchers", element: <MyVouchers /> },
            { path: "edit", element: <EditProfile /> },
            { path: "guarantee-policy", element: <GuaranteePolicy /> },
            { path: "terms", element: <TermsOfUse /> },
            { path: "warranty-policy", element: <WarrantyPolicy /> },
          ],
        },
        // News/Article routes - moved to UserLayout
        {
          path: "news",
          children: [
            { index: true, element: <News /> },
            { path: "search", element: <ArticleSearch /> },
            { path: "article/:slug", element: <NewsDetail /> },
            { path: "category/:slug", element: <NewsCategory /> },
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
      path: AUTH_PATH.LOGIN_STAFF,
      element: (
        <RoleBasedAuthWrapper>
          <StaffLogin />
        </RoleBasedAuthWrapper>
      ),
    },
    {
      path: AUTH_PATH.LOGIN_SHIPPER,
      element: (
        <RoleBasedAuthWrapper>
          <ShipperLogin />
        </RoleBasedAuthWrapper>
      ),
    },
    {
      path: AUTH_PATH.GOOGLE_CALLBACK,
      element: <AuthCallbackComponent />,
    },

    // Admin routes
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
        { path: ADMIN_PATH.BANNERS, element: <Banners /> },
        { path: ADMIN_PATH.CUSTOMERS, element: <Customers /> },
        { path: ADMIN_PATH.SUPPLIERS, element: <Suppliers /> },
        { path: ADMIN_PATH.ORDERS, element: <Orders /> },
        { path: ADMIN_PATH.SETTINGS, element: <Settings /> },
        { path: ADMIN_PATH.ANALYTICS, element: <Analytics /> },
        { path: ADMIN_PATH.REPORTS_VOUCHER, element: <VoucherAnalytics /> },
        { path: ADMIN_PATH.REPORTS_PROMOTION, element: <PromotionAnalytics /> },
        { path: ADMIN_PATH.STAFFS, element: <Staffs /> },
        { path: ADMIN_PATH.PROMOTIONS, element: <Promotions /> },
        { path: ADMIN_PATH.PROMOTION_ADD, element: <AddPromotion /> },
        { path: "/admin/promotions/edit/:id", element: <EditPromotion /> },
        { path: ADMIN_PATH.VOUCHERS, element: <Vouchers /> },
        { path: "/admin/vouchers/create", element: <VoucherForm /> },
        { path: "/admin/vouchers/edit/:id", element: <VoucherForm /> },
        { path: ADMIN_PATH.ARTICLES, element: <Articles /> },
        { path: ADMIN_PATH.ARTICLE_ADD, element: <AddArticle /> },
        { path: "/admin/articles/edit/:id", element: <EditArticle /> },
        { path: ADMIN_PATH.ARTICLE_CATEGORIES, element: <ArticleCategories /> },
        {
          path: "category-assignment",
          element: <CategoryAssignmentPage />,
        },
        { path: ADMIN_PATH.FILTER_CRITERIAS, element: <FilterCriterias /> },
        { path: ADMIN_PATH.CHAT, element: <ChatManagement /> },
        { path: "/admin/feedbacks", element: <Feedbacks /> },
        {
          path: "/admin/product-questions",
          element: <AdminProductQuestionsPage />,
        },
        { path: ADMIN_PATH.PURCHASE_ORDERS, element: <PurchaseOrders /> },
        { path: ADMIN_PATH.PURCHASE_ORDER_ADD, element: <AddPurchaseOrder /> },
        { path: "/admin/purchase-orders/:id", element: <PurchaseOrderDetail /> },
        { path: ADMIN_PATH.CARTS, element: <Carts /> },
      ],
    },

    // Staff routes
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
        { path: STAFF_PATH.CHAT, element: <ChatManagement /> },
        { path: STAFF_PATH.ASSIGN_DELIVERY, element: <StaffAssignDelivery /> },
        { path: STAFF_PATH.SELL, element: <StaffSell /> },
        { path: STAFF_PATH.PAYMENT_STATUS, element: <StaffPaymentStatus /> },
        { path: STAFF_PATH.CARTS, element: <Carts /> },
      ],
    },

    // Shipper routes
    {
      path: SHIPPER_PATH.DASHBOARD,
      element: (
        <ShipperRoute>
          <ShipperLayout />
        </ShipperRoute>
      ),
      children: [
        { index: true, element: <ShipperDashboard /> },
        { path: SHIPPER_PATH.DELIVERIES, element: <Deliveries /> },
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
