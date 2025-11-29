import axiosClient from '@/configurations/axios.config';
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrderListResponse,
  PurchaseOrderFilter,
} from '@/types/purchase-order.type';

export const purchaseOrderService = {
  getPurchaseOrders: async (
    page: number = 1,
    size: number = 10,
    filters: PurchaseOrderFilter = {}
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.supplierId) params.set('supplierId', filters.supplierId);
    if (filters.supplierName) params.set('supplierName', filters.supplierName);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    const response = await axiosClient.get<PurchaseOrderListResponse>(
      `/purchase-orders?${params.toString()}`
    );
    return response.data;
  },

  getPurchaseOrderById: async (id: number) => {
    const response = await axiosClient.get<PurchaseOrderResponse>(
      `/purchase-orders/${id}`
    );
    return response.data;
  },

  createPurchaseOrder: async (request: CreatePurchaseOrderRequest) => {
    const response = await axiosClient.post<PurchaseOrderResponse>(
      '/purchase-orders',
      request
    );
    return response.data;
  },


};
