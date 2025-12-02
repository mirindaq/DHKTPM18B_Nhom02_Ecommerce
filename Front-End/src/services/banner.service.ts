import axiosClient from '@/configurations/axios.config';
import type {
  CreateBannerRequest,
  UpdateBannerRequest,
  BannerResponse,
  BannerListResponse,
  BannerDisplayResponse
} from '@/types/banner.type';

export const bannerService = {
  getBanners: async (
    page: number = 1, 
    size: number = 7, 
    startDate?: string,
    endDate?: string,
    isActive?: boolean
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const response = await axiosClient.get<BannerListResponse>(`/banners?${params.toString()}`);
    return response.data;
  },

  getBannerById: async (id: number) => {
    const response = await axiosClient.get<BannerResponse>(`/banners/${id}`);
    return response.data;
  },

  createBanner: async (request: CreateBannerRequest) => {
    const response = await axiosClient.post<BannerResponse>('/banners/add', request);
    return response.data;
  },

  updateBanner: async (id: number, request: UpdateBannerRequest) => {
    const response = await axiosClient.put<BannerResponse>(`/banners/update/${id}`, request);
    return response.data;
  },

  deleteBanner: async (id: number) => {
    await axiosClient.delete(`/banners/delete/${id}`);
  },

  getBannersToDisplay: async () => {
    const response = await axiosClient.get<BannerDisplayResponse>(`/banners/display`);
    return response.data;
  }
};

