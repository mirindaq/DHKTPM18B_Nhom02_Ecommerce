// src/types/province.type.ts
import type { ResponseApi } from './responseApi.type'

export type Province = {
  id: number
  name: string
}

export type ProvinceResponse = ResponseApi<Province[]>