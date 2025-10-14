
import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';
import type { RankVoucherResponse } from '@/types/ranking.type';

export const rankingService = {
  getAllRankings: async () => {
    const response = await axiosClient.get<ResponseApi<RankVoucherResponse[]>>('/rankings');
    return response.data;
  }
};