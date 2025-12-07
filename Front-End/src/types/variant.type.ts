import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type VariantValue = {
  id: number;
  value: string;
  variantId: number;
  variantName?: string;
  slug: string;
  status: boolean;
};

export type Variant = {
  id: number;
  name: string;
  status: boolean;
  slug: string;
  variantValues: VariantValue[];
  createdAt?: string;
};

export type CreateVariantValueRequest = {
  value: string;
};

export type CreateVariantRequest = {
  name: string;
  status?: boolean;
  variantValues?: CreateVariantValueRequest[];
};

// VariantCategory types - Đồng bộ với BE VariantCategoryResponse
export type VariantCategory = {
  id: number;
  variantId: number;
  variantName: string;
  categoryId: number;
  categoryName: string;
};

export type CreateVariantCategoryRequest = {
  variantId: number;
  categoryId: number;
};

export type VariantCategoryResponse = ResponseApi<VariantCategory>;
export type VariantCategoryListResponse = ResponseApi<VariantCategory[]>;

export type VariantResponse = ResponseApi<Variant>;

export type VariantListResponse = ResponseApiWithPagination<Variant[]>;
export type VariantListResponseForCreateProduct = ResponseApi<Variant[]>;

export type VariantValueResponse = ResponseApi<VariantValue[]>;
