import type { Category } from "./category.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type VariantValue = {
  id: number;
  value: string;
  variantId: number;
  variantName?: string;
  status: boolean;
};

export type Variant = {
  id: number;
  name: string;
  status: boolean;
  category: Category;
  variantValues: VariantValue[];
};

export type CreateVariantValueRequest = {
  value: string;
};

export type CreateVariantRequest = {
  name: string;
  status?: boolean;
  categoryId?: number;
  variantValues?: CreateVariantValueRequest[];
};

export type VariantResponse = ResponseApi<Variant>;

export type VariantListResponse = ResponseApiWithPagination<Variant[]>;
export type VariantListResponseForCreateProduct = ResponseApi<Variant[]>;

export type VariantValueResponse = ResponseApi<VariantValue[]>;
