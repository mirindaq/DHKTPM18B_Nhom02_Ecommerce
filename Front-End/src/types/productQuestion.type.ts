import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type ProductQuestionAnswer = {
  id: number;
  userName: string;
  content: string;
  status: boolean;
  admin: boolean;
  createdAt?: string;
};

export type ProductQuestion = {
  id: number;
  content: string;
  status: boolean;
  userName: string;
  answers: ProductQuestionAnswer[];
  createdAt?: string;
};

export type ProductQuestionAddRequest = {
  content: string;
  productId: number;
};

export type ProductQuestionAnswerAddRequest = {
  content: string;
  productQuestionId: number;
};

export type ProductQuestionResponse = ResponseApi<ProductQuestion>;
export type ProductQuestionListResponse = ResponseApiWithPagination<ProductQuestion[]>;

//
// === PHẦN MỚI - THÊM VÀO CUỐI FILE ===
// Trả về câu hỏi kèm thông tin sản phẩm cho bảng admin
export interface ProductQuestionWithProduct extends ProductQuestion {
  productId: number;
  productName: string;
  productSlug: string;
  productImage?: string;
  updatedAt?: string;
}

export interface AdminProductQuestionListResponse {
  status: number;
  message: string;
  data: {
    limit: number;
    page: number;
    totalItem: number;
    totalPage: number;
    data: ProductQuestionWithProduct[];
  };
}

export interface ProductQuestionUpdateStatusRequest {
  status: boolean;
}

export interface ProductQuestionAnswerUpdateStatusRequest {
  status: boolean;
}

export interface ProductQuestionFilters {
  status?: boolean | "all";
  search?: string;
  productId?: number;
  page?: number;
  size?: number;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}