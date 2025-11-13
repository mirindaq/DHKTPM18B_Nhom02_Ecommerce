import type { ResponseApi } from './responseApi.type'

export type Province = {
  code: string
  name: string
}

export type ProvinceResponse = ResponseApi<Province[]>
