import type { Brand } from "./brand.type"
import type { Category } from "./category.type"
import type {
  ResponseApi,
  ResponseApiWithPagination,
} from "./responseApi.type"

/**
 * Kiểu dữ liệu cho một liên kết Category-Brand
 * (Khớp với CategoryBrandResponse DTO)
 */
export type CategoryBrand = {
  id: number // ID của chính liên kết
  categoryId: number
  categoryName: string
  brandId: number
  brandName: string
}

/**
 * Kiểu dữ liệu để Gán/Hủy gán
 * (Khớp với BrandCategoryRequest DTO)
 */
export type BrandCategoryRequest = {
  categoryId: number
  brandId: number
}

// ===============================================
// === CÁC WRAPPER RESPONSE CHO SERVICE ===
// ===============================================

/**
 * Response cho API gán/tạo mới một liên kết
 * @POST /api/v1/category-brands/assign
 */
export type CategoryBrandResponseApi = ResponseApi<CategoryBrand>

/**
 * Response cho API lấy danh sách Brand theo Category
 * @GET /api/v1/category-brands/categories/{id}/brands
 */
export type BrandListByCategoryResponseApi = ResponseApiWithPagination<Brand[]>

/**
 * Response cho API lấy danh sách Category theo Brand
 * @GET /api/v1/category-brands/brands/{id}/categories
 */
export type CategoryListByBrandResponseApi = ResponseApiWithPagination<
  Category[]
>