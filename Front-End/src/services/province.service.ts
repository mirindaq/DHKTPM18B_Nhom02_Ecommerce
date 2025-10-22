// src/services/province.service.ts
import axiosClient from '@/configurations/axios.config';// nếu bạn không có "@/utils/api" thì thay bằng import axios from "axios";

export const provinceService = {
  getAllProvinces: async () => {
    const res = await axiosClient.get("/provinces");
    return res.data.data;
  },

  getWardsByProvince: async (provinceCode: string) => {
    const res = await axiosClient.get(`/provinces/${provinceCode}/wards`);
    return res.data.data;
  },

  getAllWards: async () => {
    const res = await axiosClient.get("/provinces/wards");
    return res.data.data;
  },
};
