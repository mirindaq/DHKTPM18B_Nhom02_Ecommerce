// src/types/ward.type.ts
import type { ResponseApi } from './responseApi.type'

export type Ward = {
  id: number
  name: string
  provinceId: number
}

export type WardResponse = ResponseApi<Ward[]>