import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type"

export interface Supplier {
  id: string 
  name: string
  phone: string
  address: string
  status: boolean
  createdAt: string
  updatedAt: string
}

export type SupplierListResponse = ResponseApiWithPagination<Supplier[]>
export type SupplierResponse = ResponseApi<Supplier>

export interface SupplierRequest {
  name: string
  phone: string
  address?: string
}