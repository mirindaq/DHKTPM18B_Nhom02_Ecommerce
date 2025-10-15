// Auth paths
export const AUTH_PATH = {
  LOGIN_ADMIN: "/admin/login",
  LOGIN_USER: "/login",
  REGISTER_USER: "/register",
  GOOGLE_CALLBACK: "/auth/google/callback",
};

// Admin paths
export const ADMIN_PATH = {
  DASHBOARD: "/admin",
  PRODUCTS: "/admin/products",
  PRODUCT_ADD: "/admin/products/add",
  PRODUCT_EDIT: "/admin/products/edit/:id",
  CATEGORIES: "/admin/categories",
  BRANDS: "/admin/brands",
  EMPLOYEES: "/admin/employees",
  CUSTOMERS: "/admin/customers",
  ORDERS: "/admin/orders",
  SETTINGS: "/admin/settings",
  ANALYTICS: "/admin/analytics",
  VARIANTS: "/admin/variants",
  STAFFS: "/admin/staffs",
  PROMOTIONS: "/admin/promotions",
  VOUCHERS: "/admin/vouchers",
};

// Staff paths
export const STAFF_PATH = {
  DASHBOARD: "/staff",
  PRODUCTS: "/staff/products",
  ORDERS: "/staff/orders",
  CUSTOMERS: "/staff/customers",
};

// Shipper paths
export const SHIPPER_PATH = {
  DASHBOARD: "/shipper",
  ORDERS: "/shipper/orders",
  DELIVERIES: "/shipper/deliveries",
};

// Public (user) paths
export const PUBLIC_PATH = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id", 
  CART: "/cart",
  CHECKOUT: "/checkout",
  SEARCH_PAGE: "/search",
  BLOGS: "/blogs",
  BRANDS: "/brands",
  COLLECTIONS: "/collections",
  MEMBERSHIP: "/membership",
  TERMS_AND_CONDITIONS: "/terms",
  DELIVERY_POLICY: "/delivery-policy",
  EXCLUSIVE: "/exclusive",
};

// User account paths
export const USER_PATH = {
  ACCOUNT: "/account",
  OVERVIEW: "/account/overview",
  ORDER_HISTORY: "/account/orders",
  ORDER_HISTORY_DETAIL: "/account/orders/:orderId",
  WISHLIST: "/account/wishlist",
  ADDRESS: "/account/address",
  PAY: "/pay",
  PAY_SUCCESS: "/pay/success",
};
