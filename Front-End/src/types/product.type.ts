import type { Attribute } from "./attribute.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";
import type { VariantValue } from "./variant.type";

export type Product = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  // discount: number;
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
  description: string;
  thumbnail: string;
  status?: boolean;
  spu: string;
  brandId: number;
  categoryId: number;
  productImages: string[];
  attributes?: ProductAttributeRequest[];
  variants?: ProductVariantRequest[];
  filterValueIds?: number[];
};

export type ProductAttributeRequest = {
  attributeId: number;
  value: string;
};

export type ProductVariantRequest = {
  price: number;
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
  discount: number;
  productVariantValues: ProductVariantValueResponse[];
};

export type ProductVariantValueResponse = {
  id: number;
  variantValue: VariantValue;
};


export type ProductVariantDescription = {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  sku: string;
  stock: number;
  brandName: string;
  categoryName: string;
};

export type ProductVariantPromotionRequest = {
  productVariantIds: number[];
}


export type ProductVariantPromotionResponse = {
  productVariantId: number;
  discount: number;
}

export type ProductResponse = ResponseApi<Product>;
export type ProductListResponse = ResponseApiWithPagination<Product[]>;
export type ProductVariantDescriptionResponse = ResponseApi<ProductVariantDescription[]>;
export type ProductVariantPromotionResponseApi = ResponseApi<ProductVariantPromotionResponse[]>;