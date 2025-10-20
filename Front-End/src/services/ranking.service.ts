import axiosClient from "@/configurations/axios.config";
import type { RankResponse } from "@/types/ranking.type";

export const rankingService = {
  getAllRankings: async () => {
    const response = await axiosClient.get<RankResponse>("/rankings");
    return response.data;
  },
};
