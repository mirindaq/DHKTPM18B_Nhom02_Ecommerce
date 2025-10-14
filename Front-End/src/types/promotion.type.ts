import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export interface PromotionTarget {
  productId?: number;
  productVariantId?: number;
  categoryId?: number;
}

export interface PromotionSummary {
  id: number;
  name: string;
  type: string;
  discountType: string;
  discountValue: number;
  active: boolean;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface CreatePromotionRequest {
  name: string;
  type: string;
  discountType: string;
  discountValue: number;
  active: boolean;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
  targets?: PromotionTarget[];
}

export interface UpdatePromotionRequest {
  name: string;
  type: string;
  discountType: string;
  discountValue: number;
  priority: number;
  description?: string;
  startDate: string;
  endDate: string;
  targets?: PromotionTarget[];
}

export interface PromotionResponse extends ResponseApi<PromotionSummary> {}
export interface PromotionListResponse extends ResponseApiWithPagination<PromotionSummary[]> {}

export interface PromotionFilter {
  name?: string;
  type?: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}
