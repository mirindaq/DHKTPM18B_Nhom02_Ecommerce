import axiosClient from "@/configurations/axios.config";
import type { RankResponse, Rank } from "@/types/ranking.type";

export const rankingService = {
  getAllRankings: async () => {
    const response = await axiosClient.get<RankResponse>("/rankings");
    return response.data;
  },
  getMyRank: async () => {
    const response = await axiosClient.get<{ status: number; message: string; data: Rank }>("/rankings/my-rank");
    return response.data;
  },
};
