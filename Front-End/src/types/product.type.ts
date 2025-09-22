import type { Attribute } from "./attribute.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";
import type { VariantValue } from "./variant.type";

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
  attribute: Attribute;
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
  variantValue: VariantValue;
};


export type ProductResponse = ResponseApi<Product>;
export type ProductListResponse = ResponseApiWithPagination<Product[]>;
