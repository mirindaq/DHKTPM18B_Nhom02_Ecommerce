// src/types/address.type.ts
import type { ResponseApi } from './responseApi.type'

export type Address = {
  id: number
  fullName: string
  phone: string
  subAddress: string
  isDefault: boolean
  wardName?: string
  provinceName?: string
  fullAddress?: string
}

export type CreateAddressRequest = {
  subAddress: string
  wardCode?: string
  fullName?: string
  phone?: string
  isDefault?: boolean
}

export type AddressResponse = ResponseApi<Address>
export type AddressListResponse = ResponseApi<Address[]>
