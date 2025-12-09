import axiosClient from '@/configurations/axios.config'
import type {
  CreateProductRequest,
  ProductFilters,
  ProductListResponse,
  ProductResponse,
  ProductVariantDescriptionResponse,
  ProductVariantPromotionRequest,
  ProductVariantPromotionResponseApi,
} from '@/types/product.type'

export const productService = {
  getProducts: async (page: number = 1, size: number = 7, filters: ProductFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    })

    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.brandId) params.set('brandId', filters.brandId.toString())
    if (filters.categoryId) params.set('categoryId', filters.categoryId.toString())
    if (filters.status !== undefined && filters.status !== null) params.set('status', filters.status.toString())
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())

    const response = await axiosClient.get<ProductListResponse>(
      `/products?${params.toString()}`
    )
    return response.data
  },

  getProductById: async (id: number) => {
    const response = await axiosClient.get<ProductResponse>(`/products/${id}`)
    return response.data
  },

  createProduct: async (request: CreateProductRequest) => {
    const response = await axiosClient.post<ProductResponse>('/products', request)
    return response.data
  },

  updateProduct: async (id: number, request: CreateProductRequest) => {
    const response = await axiosClient.put<ProductResponse>(`/products/${id}`, request)
    return response.data
  },

  changeStatusProduct: async (id: number) => {
    const response = await axiosClient.patch<ProductResponse>(`/products/${id}/status`)
    return response.data
  },

  getProductBySlug: async (slug: string) => {
    const response = await axiosClient.get<ProductResponse>(`/products/slug/${slug}`)
    return response.data
  },
  getSkusForPromotion: async (productId: number) => {
    const response = await axiosClient.get<ProductVariantDescriptionResponse>(`/products/${productId}/skus`)
    return response.data
  },

  getProductsVariantPromotions: async (request: ProductVariantPromotionRequest) => {
    const response = await axiosClient.post<ProductVariantPromotionResponseApi>('/products/variants/promotions', request)
    return response.data
  },

  searchProducts: async (categorySlug: string, page: number = 1, size: number = 8, filters: Record<string, string> = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    })
    const response = await axiosClient.get<ProductListResponse>(
      `/products/search/${categorySlug}?${params.toString()}`
    )
    return response.data
  },

  searchProductsWithElasticsearch: async (query: string, page: number = 1, size: number = 12, sortBy?: string) => {
    const params = new URLSearchParams({
      query: query,
      page: page.toString(),
      size: size.toString()
    })
    if (sortBy) {
      params.set('sortBy', sortBy)
    }
    const response = await axiosClient.get<ProductListResponse>(
      `/products/search?${params.toString()}`
    )
    return response.data
  },

  getAutoCompleteSuggestions: async (query: string, limit: number = 5) => {
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString()
    })
    const response = await axiosClient.get<{ data: string[] }>(
      `/products/search/autocomplete?${params.toString()}`
    )
    return response.data.data
  }
}
