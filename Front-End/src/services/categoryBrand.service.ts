import axiosClient from '@/configurations/axios.config';
import type {
  SetBrandsForCategoryRequest,
  BrandListByCategoryResponse,
  CategoryListByBrandResponse,
} from '@/types/category-brand.type';
import type { ResponseApi } from '@/types/responseApi.type';

export const categoryBrandService = {
  getBrandsByCategoryId: async (
    categoryId: number,
    brandName: string = ""
  ) => {
    const query = brandName
      ? `?brandName=${encodeURIComponent(brandName)}`
      : '';
    const response = await axiosClient.get<BrandListByCategoryResponse>(
      `/category-brands/categories/${categoryId}/brands${query}`
    );
    return response.data;
  },

  getCategoriesByBrandId: async (
    brandId: number,
    categoryName: string = ""
  ) => {
    const query = categoryName
      ? `?categoryName=${encodeURIComponent(categoryName)}`
      : '';
    const response = await axiosClient.get<CategoryListByBrandResponse>(
      `/category-brands/brands/${brandId}/categories${query}`
    );
    return response.data;
  },

  setBrandsForCategory: async (request: SetBrandsForCategoryRequest) => {
    const response = await axiosClient.post<ResponseApi<void>>(
      '/category-brands/set-brands',
      request
    );
    return response.data;
  },
};