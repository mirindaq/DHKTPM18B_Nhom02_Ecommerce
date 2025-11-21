import axiosClient from '@/configurations/axios.config';
import type {
  CreateFilterCriteriaRequest,
  SetFilterValuesForCriteriaRequest,
  FilterCriteriaResponse,
  FilterCriteriaListResponse,
  FilterValueListResponse
} from '@/types/filterCriteria.type';

export const filterCriteriaService = {
  getFilterCriteriaByCategory: async (categoryId: number, name: string = "") => {
    const url = name 
      ? `/filter-criteria/categories/${categoryId}?name=${name}`
      : `/filter-criteria/categories/${categoryId}`;
    const response = await axiosClient.get<FilterCriteriaListResponse>(url);
    return response.data;
  },

  getFilterCriteriaByCategorySlug: async (categorySlug: string, name: string = "") => {
    const url = name 
      ? `/filter-criteria/categories/slug/${categorySlug}?name=${name}`
      : `/filter-criteria/categories/slug/${categorySlug}`;
    const response = await axiosClient.get<FilterCriteriaListResponse>(url);
    return response.data;
  },

  createFilterCriteria: async (request: CreateFilterCriteriaRequest) => {
    const response = await axiosClient.post<FilterCriteriaResponse>('/filter-criteria', request);
    return response.data;
  },

  setFilterValuesForCriteria: async (request: SetFilterValuesForCriteriaRequest) => {
    await axiosClient.post('/filter-criteria/set-values', request);
  },

  getFilterValuesByCriteriaId: async (filterCriteriaId: number, value?: string) => {
    const url = value
      ? `/filter-criteria/${filterCriteriaId}/values?value=${value}`
      : `/filter-criteria/${filterCriteriaId}/values`;
    const response = await axiosClient.get<FilterValueListResponse>(url);
    return response.data;
  },

  getFilterValuesByProductId: async (productId: number) => {
    const response = await axiosClient.get<FilterValueListResponse>(`/filter-criteria/products/${productId}/values`);
    return response.data;
  },

  deleteFilterCriteria: async (id: number) => {
    await axiosClient.delete(`/filter-criteria/${id}`);
  }
};

