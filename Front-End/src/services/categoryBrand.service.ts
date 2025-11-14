import axiosClient from "@/configurations/axios.config"
import type {
  ResponseApi,
  ResponseApiWithPagination,
} from "@/types/responseApi.type"
import type { Brand } from "@/types/brand.type"
import type { Category } from "@/types/category.type"
import type {
  BrandListByCategoryResponseApi,
  CategoryListByBrandResponseApi,
} from "@/types/category-brand.type"

// --- THÊM TYPE REQUEST MỚI ---
interface SetBrandsForCategoryRequest {
  categoryId: number
  brandIds: number[] // Mảng các ID
}

const categoryBrandService = {
  /**
   * Lấy danh sách Brands thuộc về một Category (vẫn dùng)
   */
  getBrandsByCategoryId: async (
    categoryId: number,
    brandName: string = "",
    page: number = 1,
    size: number = 10,
  ) => {
    const query = `page=${page}&size=${size}&brandName=${encodeURIComponent(
      brandName,
    )}`
    const response = await axiosClient.get<BrandListByCategoryResponseApi>(
      `/category-brands/categories/${categoryId}/brands?${query}`,
    )
    return response.data
  },

  /**
   * Lấy danh sách Categories chứa một Brand (vẫn dùng)
   */
  getCategoriesByBrandId: async (
    brandId: number,
    categoryName: string = "",
    page: number = 1,
    size: number = 10,
  ) => {
    const query = `page=${page}&size=${size}&categoryName=${encodeURIComponent(
      categoryName,
    )}`
    const response = await axiosClient.get<CategoryListByBrandResponseApi>(
      `/category-brands/brands/${brandId}/categories?${query}`,
    )
    return response.data
  },

  // --- API MỚI THAY THẾ CHO CẢ GÁN VÀ XÓA ---
  /**
   * Đặt lại toàn bộ danh sách thương hiệu cho một danh mục
   * @POST /api/v1/category-brands/set-brands
   */
  setBrandsForCategory: async (request: SetBrandsForCategoryRequest) => {
    const response = await axiosClient.post<ResponseApi<void>>(
      "/category-brands/set-brands",
      request,
    )
    return response.data
  },

  // --- XÓA 2 HÀM CŨ ---
  // assignBrandToCategory: ...
  // unassignBrandFromCategory: ...
}

export default categoryBrandService