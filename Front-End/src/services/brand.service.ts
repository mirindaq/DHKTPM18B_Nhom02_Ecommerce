import axiosClient from '@/configurations/axios.config';
import type {
  CreateBrandRequest,
  BrandResponse,
  BrandListResponse
} from '@/types/brand.type';

export const brandService = {
  getBrands: async (page: number = 1, size: number = 10, search: string = "") => {
    const response = await axiosClient.get<BrandListResponse>(`/brands?page=${page}&size=${size}&brandName=${search}`);
    return response.data;
  },

  getBrandById: async (id: number) => {
    const response = await axiosClient.get<BrandResponse>(`/brands/${id}`);
    return response.data;
  },

  createBrand: async (request: CreateBrandRequest) => {
    const response = await axiosClient.post<BrandResponse>('/brands', request);
    return response.data;
  },

  updateBrand: async (id: number, request: CreateBrandRequest) => {
    const response = await axiosClient.put<BrandResponse>(`/brands/${id}`, request);
    return response.data;
  },

  changeStatusBrand: async (id: number) => {
    await axiosClient.put(`/brands/change-status/${id}`);
  }
};
