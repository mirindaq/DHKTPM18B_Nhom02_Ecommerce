import axiosClient from '@/configurations/axios.config';
import type { OrderCreationRequest, OrderListResponse } from '@/types/order.type';

export const orderService = {
  createOrder: async (request: OrderCreationRequest) => {
    const response = await axiosClient.post("/orders", request);
    return response.data;
  },
  getMyOrders: async (page: number = 1, size: number = 7, status?: string, startDate?: string, endDate?: string) => {
    const response = await axiosClient.get<OrderListResponse>(`/orders/my-orders?page=${page}&size=${size}&status=${status}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
}