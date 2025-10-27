import axiosClient from "@/configurations/axios.config";
import type {
  ProductQuestionAddRequest,
  ProductQuestionAnswerAddRequest,
  ProductQuestionListResponse,
  ProductQuestionResponse,
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
};
