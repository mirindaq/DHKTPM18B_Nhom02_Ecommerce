import axiosClient from '@/configurations/axios.config';
import type { 
  VariantCategoryListResponse,
} from '@/types/variant.type';

export const variantCategoryService = {
  // Lấy variant-categories theo categoryId
  getVariantCategoriesByCategoryId: async (categoryId: number) => {
    const response = await axiosClient.get<VariantCategoryListResponse>(
      `/variant-categories/category/${categoryId}`
    );
    return response.data;
  },

  // Gán nhiều variants cho một category
  assignVariantsToCategory: async (categoryId: number, variantIds: number[]) => {
    const response = await axiosClient.post<VariantCategoryListResponse>(
      `/variant-categories/assign-variants`,
      { categoryId, variantIds }
    );
    return response.data;
  },
};
