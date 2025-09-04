import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type Brand = {
  id: number;
  name: string;
  description: string;
  image: string;
  origin: string;
  status: boolean;
  createdAt: string;
  modifiedAt: string;
};

export type CreateBrandRequest = {
  name: string;
  description?: string;
  image?: string;
  origin: string;
  status?: boolean;
};

export type BrandResponse = ResponseApi<Brand>;

export type BrandListResponse = ResponseApiWithPagination<Brand[]>;

