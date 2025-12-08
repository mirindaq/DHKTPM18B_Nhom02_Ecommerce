import type { ResponseApi } from "./responseApi.type";

export type Cart = {
  cartId: number;
  userId: number;
  items: CartDetailResponse[];
  totalPrice: number;
};

export type CartDetailResponse = {
  id: number;
  productVariantId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  discount: number;
  price: number;
};

export type CartWithCustomer = {
  cartId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  totalItems: number;
  items: CartDetailResponse[];
  totalPrice: number;
  modifiedAt: string;
};

export type PaginatedCartResponse = {
  content: CartWithCustomer[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

export type CartAddRequest = {
  productVariantId: number;
  quantity: number;
};

export type CartResponse = ResponseApi<Cart>;
export type CartWithCustomerResponse = ResponseApi<PaginatedCartResponse>;
