import type { ResponseApi } from "./responseApi.type";

export type WishListRequest = {
  productId: number;
};

export type WishListResponse = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
};

export type WishListListResponse = ResponseApi<WishListResponse[]>;

