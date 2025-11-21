import axiosClient from '@/configurations/axios.config';
import type { ShipperListResponse } from '@/types/shipper.type';

export const shipperService = {
  // Get all active shippers for staff to assign
  getAllActiveShippers: async () => {
    const response = await axiosClient.get<ShipperListResponse>("/shippers/active");
    return response.data;
  },

  // Get all shippers (for admin)
  getAllShippers: async () => {
    const response = await axiosClient.get<ShipperListResponse>("/shippers");
    return response.data;
  }
};
