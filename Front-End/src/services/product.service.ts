import axiosClient from '@/configurations/axios.config'
import type {
  CreateProductRequest,
  ProductListResponse,
  ProductResponse,
} from '@/types/product.type'

export const productService = {
  getProducts: async (page: number = 1, size: number = 7, search: string = "") => {
    const response = await axiosClient.get<ProductListResponse>(
      `/products?page=${page}&size=${size}&search=${search}`
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

}
