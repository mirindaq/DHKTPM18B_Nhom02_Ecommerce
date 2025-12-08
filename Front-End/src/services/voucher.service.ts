import axiosClient from '@/configurations/axios.config';
import type {
  ApiResponse,
  TopVoucherResponse,
  VoucherComparisonResponse
} from '@/types/voucher-promotion.type';

export const voucherService = {
  // Top vouchers by day
  getTopVouchersByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/top-vouchers-by-day${queryString}`
    );
    return response.data;
  },

  // Top vouchers by month
  getTopVouchersByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/top-vouchers-by-month${queryString}`
    );
    return response.data;
  },

  // Top vouchers by year
  getTopVouchersByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/top-vouchers-by-year${params}`
    );
    return response.data;
  },

  // Compare vouchers between 2 periods
  compareVoucher: async (
    timeType: string,
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
  ) => {
    const params = new URLSearchParams();
    params.append('timeType', timeType);
    params.append('startDate1', startDate1);
    params.append('endDate1', endDate1);
    params.append('startDate2', startDate2);
    params.append('endDate2', endDate2);
    
    const response = await axiosClient.get<ApiResponse<VoucherComparisonResponse>>(
      `/dashboard/compare-voucher?${params.toString()}`
    );
    return response.data;
  }
};
