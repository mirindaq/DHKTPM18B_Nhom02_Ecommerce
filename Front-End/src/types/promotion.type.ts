import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type  PromotionType = "ALL" | "CATEGORY" | "BRAND" | "PRODUCT" | "PRODUCT_VARIANT";

export interface PromotionTarget {
  productId?: number;
  productVariantId?: number;
  categoryId?: number;
  brandId?: number;
}

export interface PromotionSummary {
  id: number;
  name: string;
  promotionType: PromotionType;
  discount: number;
  active: boolean;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface CreatePromotionRequest {
  name: string;
  promotionType: PromotionType;
  discount: number;
  active: boolean;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
  promotionTargets?: PromotionTarget[];
}

export interface UpdatePromotionRequest {
  name: string;
  promotionType: PromotionType;
  discount: number;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
  promotionTargets?: PromotionTarget[];
}

export interface PromotionResponse extends ResponseApi<PromotionSummary> {}
export interface PromotionListResponse extends ResponseApiWithPagination<PromotionSummary[]> {}

export interface PromotionFilter {
  name?: string;
  type?: PromotionType;
  active?: boolean;
  startDate?: string;
  priority?: number;
}
