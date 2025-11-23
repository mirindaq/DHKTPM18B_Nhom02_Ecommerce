import type { ResponseApi } from "./responseApi.type";

export interface Shipper {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  avatar?: string;
  active: boolean;
}

export type ShipperListResponse = ResponseApi<Shipper[]>;
export type ShipperResponse = ResponseApi<Shipper>;
