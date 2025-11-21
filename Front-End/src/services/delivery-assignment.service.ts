import axiosClient from '@/configurations/axios.config';
import type {
  AssignShipperRequest,
  CompleteDeliveryRequest,
  DeliveryAssignmentResponse,
  DeliveryAssignmentListResponse
} from '@/types/delivery-assignment.type';
import type { ResponseApi } from '@/types/responseApi.type';

export const deliveryAssignmentService = {
  // Staff assigns a shipper to an order
  assignShipperToOrder: async (request: AssignShipperRequest) => {
    const response = await axiosClient.post<ResponseApi<void>>(
      "/delivery-assignments/assign-shipper",
      request
    );
    return response.data;
  },

  // Shipper starts delivery
  startDelivery: async (deliveryAssignmentId: number) => {
    const response = await axiosClient.put<ResponseApi<void>>(
      `/delivery-assignments/delivery/${deliveryAssignmentId}/start`
    );
    return response.data;
  },

  // Shipper completes delivery
  completeDelivery: async (request: CompleteDeliveryRequest) => {
    const response = await axiosClient.put<ResponseApi<void>>(
      "/delivery-assignments/delivery/complete",
      request
    );
    return response.data;
  },

  // Shipper fails delivery
  failDelivery: async (request: CompleteDeliveryRequest) => {
    const response = await axiosClient.put<ResponseApi<void>>(
      "/delivery-assignments/delivery/complete",
      request
    );
    return response.data;
  },

  // Get delivery assignment by ID
  getDeliveryAssignmentById: async (id: number) => {
    const response = await axiosClient.get<DeliveryAssignmentResponse>(
      `/delivery-assignments/${id}`
    );
    return response.data;
  },

  // Get all deliveries for current shipper
  getMyDeliveries: async () => {
    const response = await axiosClient.get<DeliveryAssignmentListResponse>(
      "/delivery-assignments/my-deliveries"
    );
    return response.data;
  },

  // Get current delivering orders for shipper
  getMyDeliveringOrders: async () => {
    const response = await axiosClient.get<DeliveryAssignmentListResponse>(
      "/delivery-assignments/my-delivering-orders"
    );
    return response.data;
  }
};
