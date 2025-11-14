// src/types/address.type.ts
import type { ResponseApi } from './responseApi.type'

export type Address = {
  id: number
  fullName: string
  phone: string
  subAddress: string
  isDefault: boolean
  wardId: number
  wardName?: string
  provinceName?: string
  fullAddress?: string
  // Thêm để hỗ trợ nested objects khi backend trả về
  ward?: {
    id: number
    name: string
  }
  province?: {
    id: number
    name: string
  }
}

export type CreateAddressRequest = {
  subAddress: string
  wardId: number 
  fullName: string 
  phone: string 
  isDefault?: boolean  
}

export type AddressResponse = ResponseApi<Address>
export type AddressListResponse = ResponseApi<Address[]>