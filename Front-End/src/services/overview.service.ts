import axiosClient from "@/configurations/axios.config";
import type {
  DashboardStatsPayload,
  MonthlyRevenue,
} from "@/types/overview.type";
import type { ResponseApi } from "@/types/responseApi.type";

export const statisticsService = {
  getDashboardStats: async (): Promise<DashboardStatsPayload> => {
    const response = await axiosClient.get<ResponseApi<DashboardStatsPayload>>(
      "/statistics/dashboard"
    );
    return response.data.data;
  },

  getMonthlyRevenue: async (): Promise<MonthlyRevenue[]> => {
    const response = await axiosClient.get<ResponseApi<MonthlyRevenue[]>>(
      "/statistics/monthly-revenue"
    );
    return response.data.data;
  },
};
