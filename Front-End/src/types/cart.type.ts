import type { ResponseApi } from "./responseApi.type";

export type Cart = {
  cartId: number;
  userId: number;
  items: CartDetailResponse[];
  totalPrice: number;
};

export type CartDetailResponse = {
  productVariantId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  discount: number;
  price: number;
};

export type CartAddRequest = {
  productVariantId: number;
  quantity: number;
};

export type CartResponse = ResponseApi<Cart>;
