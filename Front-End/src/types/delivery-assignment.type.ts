import type { ResponseApi } from "./responseApi.type";
import type { OrderResponse } from "./order.type";

export type DeliveryStatus = "ASSIGNED" | "DELIVERING" | "DELIVERED" | "FAILED";

export interface DeliveryAssignment {
  id: number;
  order?: OrderResponse;
  shipper?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
    active: boolean;
  };
  expectedDeliveryDate?: string;
  deliveryStatus: DeliveryStatus;
  deliveredAt?: string;
  createdAt: string;
  note?: string;
  deliveryImages?: string[];
}

export interface AssignShipperRequest {
  orderId: number;
  shipperId: number;
  notes?: string;
}

export interface CompleteDeliveryRequest {
  deliveryAssignmentId: number;
  success: boolean;
  note: string;
  imageUrls?: string[];
}

export type DeliveryAssignmentResponse = ResponseApi<DeliveryAssignment>;
export type DeliveryAssignmentListResponse = ResponseApi<DeliveryAssignment[]>;