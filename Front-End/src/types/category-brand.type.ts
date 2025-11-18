import type { Brand } from "./brand.type"
import type { Category } from "./category.type"
import type { ResponseApi } from "./responseApi.type"

/**
 * Request để set brands cho category
 */
export type SetBrandsForCategoryRequest = {
  categoryId: number
  brandIds: number[]
}

/**
 * Response cho API lấy danh sách Brand theo Category
 * @GET /category-brands/categories/{categoryId}/brands
 */
export type BrandListByCategoryResponse = ResponseApi<Brand[]>

/**
 * Response cho API lấy danh sách Category theo Brand
 * @GET /category-brands/brands/{brandId}/categories
 */
export type CategoryListByBrandResponse = ResponseApi<Category[]>