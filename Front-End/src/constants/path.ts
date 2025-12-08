// Auth paths
export const AUTH_PATH = {
  LOGIN_ADMIN: "/admin/login",
  LOGIN_STAFF: "/staff/login",
  LOGIN_SHIPPER: "/shipper/login",
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
  REPORTS_VOUCHER: "/admin/reports/voucher",
  REPORTS_PROMOTION: "/admin/reports/promotion",
  VARIANTS: "/admin/variants",
  STAFFS: "/admin/staffs",
  PROMOTIONS: "/admin/promotions",
  PROMOTION_ADD: "/admin/promotions/add",
  PROMOTION_EDIT: "/admin/promotions/edit/:id",
  VOUCHERS: "/admin/vouchers",
  ARTICLES: "/admin/articles",
  ARTICLE_ADD: "/admin/articles/add",
  ARTICLE_CATEGORIES: "/admin/article-categories",
  BANNERS: "/admin/banners",
  CATEGORY_ASSIGNMENT: "/admin/category-assignment",
  FILTER_CRITERIAS: "/admin/filter-criterias",
  CHAT: "/admin/chats",
  PURCHASE_ORDERS: "/admin/purchase-orders",
  PURCHASE_ORDER_ADD: "/admin/purchase-orders/add",
  PURCHASE_ORDER_DETAIL: "/admin/purchase-orders/:id",
  CARTS: "/admin/carts",
  SUPPLIERS: "/admin/suppliers", 
};

// Staff paths
export const STAFF_PATH = {
  DASHBOARD: "/staff",
  PRODUCTS: "/staff/products",
  ORDERS: "/staff/orders",
  CUSTOMERS: "/staff/customers",
  ARTICLES: "/staff/articles",
  CHAT: "/staff/chats",
  ASSIGN_DELIVERY: "/staff/assign-delivery",
  SELL: "/staff/sell",
  PAYMENT_STATUS: "/staff/payment-status",
  CARTS: "/staff/carts",
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
  NEWS: "/news",
  NEWS_SEARCH: "/news/search",
  NEWS_DETAIL: "/news/article/:slug",
  NEWS_CATEGORY: "/news/category/:slug",
  BLOGS: "/blogs",
  BRANDS: "/brands",
  COLLECTIONS: "/collections",
  MEMBERSHIP: "/membership",
  TERMS_AND_CONDITIONS: "/terms",
  DELIVERY_POLICY: "/delivery-policy",
  EXCLUSIVE: "/exclusive",
  CHAT: "/chat",
};

// User account paths
export const USER_PATH = {
  PROFILE: "/profile",
  OVERVIEW: "/profile",
  ORDERS: "/profile/orders",
  ORDER_DETAIL: "/profile/orders/:orderId",
  ADDRESSES: "/profile/addresses",
  WISHLIST: "/profile/wishlist",
  MEMBERSHIP: "/profile/membership",
  ACCOUNT_INFO: "/profile/account",
  VOUCHERS: "/profile/vouchers",
  EDIT_PROFILE: "/profile/edit",
  GUARANTEE_POLICY: "/profile/guarantee-policy",
  WARRANTY_POLICY: "/profile/warranty-policy",
  TERMS: "/profile/terms",
  PAY: "/pay",
  PAY_SUCCESS: "/pay/success",
};
