
import axiosClient from '@/configurations/axios.config';
import type { 
  CreateCategoryRequest, 
  CategoryResponse, 
  CategoryListResponse 
} from '../types/category.type';

export const categoryService = {
  getCategories: async (page: number = 1, size: number = 10) => {
    const response = await axiosClient.get<CategoryListResponse>(`/categories?page=${page}&size=${size}`);
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await axiosClient.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (request: CreateCategoryRequest) => {
    const response = await axiosClient.post<CategoryResponse>('/categories', request);
    return response.data;
  },

  updateCategory: async (id: number, request: CreateCategoryRequest) => {
    const response = await axiosClient.put<CategoryResponse>(`/categories/${id}`, request);
    return response.data;
  },

  changeStatusCategory: async (id: number) => {
    await axiosClient.put(`/categories/change-status/${id}`);
  }
};
