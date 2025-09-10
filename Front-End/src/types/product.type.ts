import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type Product = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  discount: number;
  description: string;
  thumbnail: string;
  status: boolean;
  rating: number;
  spu: string;
  brandId: number;
  categoryId: number;
  productImages: string[];
  attributes: ProductAttributeResponse[];
  variants: ProductVariantResponse[];
};

export type CreateProductRequest = {
  name: string;
  stock: number;
  discount: number;
  description: string;
  thumbnail: string;
  status?: boolean;
  spu: string;
  brandId: number;
  categoryId: number;
  productImages: string[];
  attributes?: ProductAttributeRequest[];
  variants?: ProductVariantRequest[];
};

export type ProductAttributeRequest = {
  attributeId: number;
  value: string;
};

export type ProductVariantRequest = {
  price: number;
  oldPrice?: number;
  sku: string;
  stock: number;
  variantValueIds: number[];
};

export type ProductAttributeResponse = {
  id: number;
  value: string;
  attribute: AttributeResponse;
};

export type AttributeResponse = {
  id: number;
  name: string;
  categoryName: string;
  status: boolean;
};

export type ProductVariantResponse = {
  id: number;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  productVariantValues: ProductVariantValueResponse[];
};

export type ProductVariantValueResponse = {
  id: number;
  variantValue: VariantValueResponse;
};

export type VariantValueResponse = {
  id: number;
  value: string;
  status: boolean;
  variantId: number;
  variantName: string;
  createdAt: string;
  modifiedAt: string;
};

export type ProductResponse = ResponseApi<Product>;
export type ProductListResponse = ResponseApiWithPagination<Product[]>;
