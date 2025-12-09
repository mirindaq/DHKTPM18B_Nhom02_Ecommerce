import axiosClient from "@/configurations/axios.config";
import type {
  ApiResponse,
  TopVoucherResponse,
  VoucherComparisonResponse,
  VoucherDetailResponse,
} from "@/types/voucher-promotion.type";
import type {
  CreateVoucherRequest,
  UpdateVoucherRequest,
  Voucher,
  VoucherListResponse,
  VoucherResponse,
  VoucherAvailableResponse,
} from "@/types/voucher.type";

export const voucherService = {
  // Top vouchers by day
  getTopVouchersByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/top-vouchers-by-day${queryString}`
    );
    return response.data;
  },

  // Top vouchers by month
  getTopVouchersByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/top-vouchers-by-month${queryString}`
    );
    return response.data;
  },

  // Top vouchers by year
  getTopVouchersByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : "";
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
    params.append("timeType", timeType);
    params.append("startDate1", startDate1);
    params.append("endDate1", endDate1);
    params.append("startDate2", startDate2);
    params.append("endDate2", endDate2);

    const response = await axiosClient.get<
      ApiResponse<VoucherComparisonResponse>
    >(`/dashboard/compare-voucher?${params.toString()}`);
    return response.data;
  },

  // Get voucher detail with orders
  getVoucherDetail: async (
    voucherId: number,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get<ApiResponse<VoucherDetailResponse>>(
      `/dashboard/voucher-detail/${voucherId}${queryString}`
    );
    return response.data;
  },

  // ALL vouchers by day (không giới hạn top 5)
  getAllVouchersByDay: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/all-vouchers-by-day${queryString}`
    );
    return response.data;
  },

  // ALL vouchers by month (không giới hạn top 5)
  getAllVouchersByMonth: async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/all-vouchers-by-month${queryString}`
    );
    return response.data;
  },

  // ALL vouchers by year (không giới hạn top 5)
  getAllVouchersByYear: async (year?: number) => {
    const params = year ? `?year=${year}` : "";
    const response = await axiosClient.get<ApiResponse<TopVoucherResponse[]>>(
      `/dashboard/all-vouchers-by-year${params}`
    );
    return response.data;
  },

  // Export dashboard to Excel
  exportDashboardExcel: async (
    startDate?: string,
    endDate?: string,
    type: string = "voucher"
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("type", type);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosClient.get(
      `/dashboard/export-excel${queryString}`,
      {
        responseType: "blob",
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Get filename from response header or use default
    const contentDisposition = response.headers["content-disposition"];
    let filename = `Dashboard_${type}_Report_${startDate || "all"}_to_${
      endDate || "all"
    }.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getAvailableVouchers: async () => {
    const response = await axiosClient.get<
      ApiResponse<VoucherAvailableResponse[]>
    >(`/vouchers/available`);
    return response.data.data;
  },
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

    if (name) params.append("name", name);
    if (type) params.append("type", type);
    if (active !== undefined) params.append("active", active.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosClient.get<VoucherListResponse>(
      `/vouchers?${params.toString()}`
    );
    return response.data;
  },

  getVoucherById: async (id: number) => {
    const response = await axiosClient.get<VoucherResponse>(`/vouchers/${id}`);
    return response.data;
  },

  createVoucher: async (request: CreateVoucherRequest) => {
    const response = await axiosClient.post<Voucher>("/vouchers", request);
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
  getAvailableVouchersForCustomer: async (customerId: number) => {
    const response = await axiosClient.get<ApiResponse<VoucherAvailableResponse[]>>(
      `/vouchers/available/${customerId}`
    );
    return response.data.data;
  },
};
