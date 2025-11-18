import axiosClient from '@/configurations/axios.config';
import type { OrderCreationRequest } from '@/types/order.type';

export const orderService = {
  createOrder: async (request: OrderCreationRequest) => {
    const response = await axiosClient.post("/orders", request);
    return response.data;
  }
}