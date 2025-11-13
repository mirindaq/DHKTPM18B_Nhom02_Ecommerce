import type { ResponseApi } from './responseApi.type'

export type Ward = {
  code: string
  name: string
  provinceCode: string
}

export type WardResponse = ResponseApi<Ward[]>
