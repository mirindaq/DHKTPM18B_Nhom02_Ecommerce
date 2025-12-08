import axiosClient from "@/configurations/axios.config";
import type {
  AdminProductQuestionListResponse,
  ProductQuestionAddRequest,
  ProductQuestionAnswerAddRequest,
  ProductQuestionAnswerUpdateStatusRequest,
  ProductQuestionFilters,
  ProductQuestionListResponse,
  ProductQuestionResponse,
  ProductQuestionUpdateStatusRequest,
} from "@/types/productQuestion.type";

export const productQuestionService = {
  // Lấy danh sách câu hỏi theo slug sản phẩm
  getProductQuestionsBySlug: async (
    slug: string,
    page: number = 1,
    size: number = 5
  ) => {
    const response = await axiosClient.get<ProductQuestionListResponse>(
      `/product-questions/${slug}?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Tạo câu hỏi mới
  createProductQuestion: async (data: ProductQuestionAddRequest) => {
    const response = await axiosClient.post<ProductQuestionResponse>(
      `/product-questions`,
      data
    );
    return response.data;
  },

  // Tạo phản hồi cho câu hỏi
  createProductQuestionAnswer: async (data: ProductQuestionAnswerAddRequest) => {
    const response = await axiosClient.post<ProductQuestionResponse>(
      `/product-questions/answer`,
      data
    );
    return response.data;
  },
  
}
// === PHẦN MỚI - THÊM VÀO CUỐI FILE ===

// Admin methods
export const productQuestionAdminService = {
  getAllProductQuestions: async (filters?: ProductQuestionFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.size) params.append("size", filters.size.toString());
    if (filters?.status !== undefined && filters?.status !== "all") {
      params.append("status", filters.status.toString());
    }
    if (filters?.search) params.append("search", filters.search);
    if (filters?.productId) params.append("productId", filters.productId.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await axiosClient.get<AdminProductQuestionListResponse>(
      `/admin/product-questions?${params.toString()}`
    );
    return response.data;
  },

  getProductQuestionById: async (id: number) => {
    const response = await axiosClient.get<{ data: ProductQuestionResponse }>(
      `/admin/product-questions/${id}`
    );
    return response.data;
  },

  updateProductQuestionStatus: async (
    id: number,
    data: ProductQuestionUpdateStatusRequest
  ) => {
    const response = await axiosClient.patch<{ data: ProductQuestionResponse }>(
      `/admin/product-questions/${id}/status`,
      data
    );
    return response.data;
  },

  deleteProductQuestion: async (id: number) => {
    const response = await axiosClient.delete(
      `/admin/product-questions/${id}`
    );
    return response.data;
  },

  updateProductQuestionAnswerStatus: async (
    id: number,
    data: ProductQuestionAnswerUpdateStatusRequest
  ) => {
    const response = await axiosClient.patch<{ data: ProductQuestionResponse }>(
      `/admin/product-questions/answer/${id}/status`,
      data
    );
    return response.data;
  },

  deleteProductQuestionAnswer: async (id: number) => {
    const response = await axiosClient.delete(
      `/admin/product-questions/answer/${id}`
    );
    return response.data;
  },
};

