import axiosClient from "@/configurations/axios.config";
import type {
  CreateArticleCategoryRequest,
  ArticleCategoryResponse,
  ArticleCategoryListResponse,
} from "@/types/article-category.type";

export const articleCategoryService = {
  getCategories: async (page = 1, limit = 7, title = "") => {
    const response = await axiosClient.get<ArticleCategoryListResponse>(
      `/article-categories?page=${page}&limit=${limit}&title=${encodeURIComponent(title)}`
    );
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await axiosClient.get<ArticleCategoryResponse>(
      `/article-categories/${id}`
    );
    return response.data;
  },

  createCategory: async (data: CreateArticleCategoryRequest) => {
    const response = await axiosClient.post<ArticleCategoryResponse>(
      `/article-categories`,
      data
    );
    return response.data;
  },

  updateCategory: async (id: number, data: CreateArticleCategoryRequest) => {
    const response = await axiosClient.put<ArticleCategoryResponse>(
      `/article-categories/${id}`,
      data
    );
    return response.data;
  },

};
