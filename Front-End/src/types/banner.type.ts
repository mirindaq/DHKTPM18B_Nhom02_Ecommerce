import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type Banner = {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  staffId: number;
  createdAt?: string;
  modifiedAt?: string;
};

export type CreateBannerRequest = {
  title: string;
  imageUrl: string;
  description: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export type UpdateBannerRequest = {
  title: string;
  imageUrl: string;
  description: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export type BannerResponse = ResponseApi<Banner>;

export type BannerListResponse = ResponseApiWithPagination<Banner[]>;

export type BannerDisplayResponse = ResponseApi<Banner[]>;

