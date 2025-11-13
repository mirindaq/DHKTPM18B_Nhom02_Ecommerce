import axiosClient from "@/configurations/axios.config"
import type {
  ResponseApi,
  ResponseApiWithPagination,
} from "@/types/responseApi.type"
import type { Brand } from "@/types/brand.type"
import type { Category } from "@/types/category.type"
import type {
  BrandCategoryRequest,
  CategoryBrandResponseApi,
  BrandListByCategoryResponseApi,
  CategoryListByBrandResponseApi,
} from "@/types/category-brand.type"

/**
 * Service object chứa tất cả các API liên quan đến liên kết Category-Brand
 */
const categoryBrandService = {
  /**
   * Lấy danh sách Brands thuộc về một Category (có phân trang)
   * @GET /api/v1/category-brands/categories/{categoryId}/brands
   */
  getBrandsByCategoryId: async (
    categoryId: number,
    page: number = 1,
    size: number = 10,
    brandName: string = "",
  ) => {
    const query = `page=${page}&size=${size}&brandName=${encodeURIComponent(
      brandName,
    )}`

    // Kiểu trả về là ResponseApiWithPagination<Brand[]>
    const response = await axiosClient.get<BrandListByCategoryResponseApi>(
      `/category-brands/categories/${categoryId}/brands?${query}`,
    )
    return response.data
  },

  /**
   * Lấy danh sách Categories chứa một Brand (có phân trang)
   * @GET /api/v1/category-brands/brands/{brandId}/categories
   */
  getCategoriesByBrandId: async (
    brandId: number,
    page: number = 1,
    size: number = 10,
    categoryName: string = "",
  ) => {
    const query = `page=${page}&size=${size}&categoryName=${encodeURIComponent(
      categoryName,
    )}`

    // Kiểu trả về là ResponseApiWithPagination<Category[]>
    const response = await axiosClient.get<CategoryListByBrandResponseApi>(
      `/category-brands/brands/${brandId}/categories?${query}`,
    )
    return response.data
  },

  /**
   * Gán (liên kết) một Brand vào một Category
   * @POST /api/v1/category-brands/assign
   */
  assignBrandToCategory: async (data: BrandCategoryRequest) => {
    // Kiểu trả về là ResponseApi<CategoryBrand>
    const response = await axiosClient.post<CategoryBrandResponseApi>(
      "/category-brands/assign",
      data,
    )
    return response.data
  },

  /**
   * Hủy gán (xóa liên kết) một Brand khỏi một Category
   * @DELETE /api/v1/category-brands/unassign
   */
  unassignBrandFromCategory: async (data: BrandCategoryRequest) => {
    // Kiểu trả về là ResponseApi<void> (không có dữ liệu data)
    const response = await axiosClient.delete<ResponseApi<void>>(
      "/category-brands/unassign",
      {
        data, // Gửi payload (BrandCategoryRequest) trong body của request DELETE
      },
    )
    return response.data
  },
}

export default categoryBrandService