import axiosClient from '@/configurations/axios.config';
import type { OrderCreationRequest, OrderListResponse, OrderApiResponse, OrderSearchParams } from '@/types/order.type';

export const orderService = {
  createOrder: async (request: OrderCreationRequest) => {
    const response = await axiosClient.post("/orders", request);
    return response.data;
  },

  getMyOrders: async (page: number = 1, size: number = 7, status?: string, startDate?: string, endDate?: string) => {
    const response = await axiosClient.get<OrderListResponse>(`/orders/my-orders`, {
      params: { page, size, status, startDate, endDate }
    });
    return response.data;
  },

  getAllOrdersForAdmin: async (params: OrderSearchParams) => {
    const queryParams = new URLSearchParams();

    if (params.customerName) queryParams.append('customerName', params.customerName);
    if (params.orderDate) queryParams.append('orderDate', params.orderDate);
    if (params.customerPhone) queryParams.append('customerPhone', params.customerPhone);
    if (params.status) queryParams.append('status', params.status);
    if (params.isPickup !== undefined) queryParams.append('isPickup', params.isPickup.toString());
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('size', (params.size || 10).toString());

    const response = await axiosClient.get<OrderListResponse>(`/orders/admin?${queryParams.toString()}`);
    return response.data;
  },

  getOrderDetailById: async (id: number) => {
    const response = await axiosClient.get<OrderApiResponse>(`/orders/${id}`);
    return response.data;
  },

  confirmOrder: async (id: number) => {
    const response = await axiosClient.put<OrderApiResponse>(`/orders/${id}/confirm`);
    return response.data;
  },

  cancelOrder: async (id: number) => {
    const response = await axiosClient.put<OrderApiResponse>(`/orders/${id}/cancel`);
    return response.data;
  },

  processOrder: async (id: number) => {
    const response = await axiosClient.put<OrderApiResponse>(`/orders/${id}/process`);
    return response.data;
  },

  completeOrder: async (id: number) => {
    const response = await axiosClient.put<OrderApiResponse>(`/orders/${id}/complete`);
    return response.data;
  },

  getOrdersNeedShipper: async (page: number = 1, size: number = 10) => {
    const response = await axiosClient.get<OrderListResponse>(`/orders/need-shipper`, {
      params: { page, size }
    });
    return response.data;
  }
};
