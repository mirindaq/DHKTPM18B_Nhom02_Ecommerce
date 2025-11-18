// src/services/province.service.ts
import axiosClient from '@/configurations/axios.config';

export const provinceService = {
  getAllProvinces: async () => {
    const res = await axiosClient.get("/provinces");
    return res.data.data; // ← ResponseSuccess.data
  },

  getWardsByProvince: async (provinceId: number) => {
    const res = await axiosClient.get(`/provinces/${provinceId}/wards`);
    return res.data.data; // ← ResponseSuccess.data
  },

  getAllWards: async () => {
    const res = await axiosClient.get("/provinces/wards");
    return res.data.data;
  },
};