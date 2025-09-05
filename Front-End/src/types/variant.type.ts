import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type VariantValue = {
  id: number;
  value: string;
  variantId: number;
  status: boolean;
};

export type Variant = {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
  modifiedAt: string;
  variantValues: VariantValue[];
};

export type CreateVariantValueRequest = {
  value: string;
};

export type CreateVariantRequest = {
  name: string;
  status?: boolean;
  variantValues?: CreateVariantValueRequest[];
};

export type VariantResponse = ResponseApi<Variant>;

export type VariantListResponse = ResponseApiWithPagination<Variant[]>;

export type VariantValueResponse = ResponseApi<VariantValue[]>;
