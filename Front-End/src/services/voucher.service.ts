
import axiosClient from '@/configurations/axios.config';
import type {
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherResponse,
  VoucherListResponse,
  VoucherAvailableResponse,
  Voucher
} from '@/types/voucher.type';

export const voucherService = {
  getVouchers: async (
    page: number = 1, 
    limit: number = 10, 
    name?: string, 
    type?: string, 
    active?: boolean, 
    startDate?: string, 
    endDate?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (name) params.append('name', name);
    if (type) params.append('type', type);
    if (active !== undefined) params.append('active', active.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axiosClient.get<VoucherListResponse>(`/vouchers?${params.toString()}`);
    return response.data;
  },

  getVoucherById: async (id: number) => {
    const response = await axiosClient.get<VoucherResponse>(`/vouchers/${id}`);
    return response.data;
  },

  createVoucher: async (request: CreateVoucherRequest) => {
    const response = await axiosClient.post<Voucher>('/vouchers', request);
    return response.data;
  },

  updateVoucher: async (id: number, request: UpdateVoucherRequest) => {
    const response = await axiosClient.put<Voucher>(`/vouchers/${id}`, request);
    return response.data;
  },

  changeStatusVoucher: async (id: number) => {
    await axiosClient.put(`/vouchers/change-status/${id}`);
  },

  sendVoucherToCustomers: async (id: number) => {
    await axiosClient.put(`/vouchers/${id}/send`);
  },

  getAvailableVouchers: async () => {
    const response = await axiosClient.get<VoucherAvailableResponse[]>('/vouchers/available');
    return response.data;
  }
};