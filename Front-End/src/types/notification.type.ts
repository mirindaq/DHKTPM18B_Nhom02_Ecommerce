export interface NotificationResponse {
  type: "ORDER" | "DELIVERY";
  orderId: number;
  orderStatus?: string;
  deliveryAssignmentId?: number;
  shipperId?: number;
  deliveryStatus?: string;
  action: string;
  message: string;
  timestamp: number;
}

