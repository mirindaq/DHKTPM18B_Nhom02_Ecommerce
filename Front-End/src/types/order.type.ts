import type { CustomerSummary } from "@/types/customer.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type PaymentMethod = "CASH_ON_DELIVERY" | "VN_PAY" | "PAY_OS";

export type OrderStatus = 
  | "PENDING" 
  | "PENDING_PAYMENT" 
  | "PROCESSING" 
  | "READY_FOR_PICKUP" 
  | "DELIVERING" 
  | "SHIPPED" 
  | "FAILED" 
  | "CANCELED" 
  | "COMPLETED" 
  | "PAYMENT_FAILED";

export interface OrderCreationRequest {
  receiverAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  note?: string;
  subscribeEmail: boolean;
  email?: string;
  isPickup: boolean;
  voucherId?: number | null;
  paymentMethod: PaymentMethod;
  cartItemIds: number[];
}

export interface OrderResponse {
  id: number;
  receiverAddress: string;
  receiverName: string;
  receiverPhone: string;
  orderDate: string;
  status: OrderStatus;
  note: string;
  paymentMethod: PaymentMethod;
  isPickup: boolean;
  totalPrice: number;
  totalDiscount: number;
  finalTotalPrice: number;
  customer: CustomerSummary;
  orderDetails: OrderDetailResponse[];
}

export interface ProductVariantOrderResponse {
  id: number;
  sku: string;
  price: number;
  stock: number;
  productName: string;
  productThumbnail: string;
  brandName: string;
  categoryName: string;
}

export interface OrderDetailResponse {
  id: number;
  price: number;
  quantity: number;
  discount: number;
  finalPrice: number;
  productVariant: ProductVariantOrderResponse;
}

export interface OrderSearchParams {
  customerName?: string;
  orderDate?: string;
  customerPhone?: string;
  status?: OrderStatus;
  isPickup?: boolean;
  page?: number;
  size?: number;
}

export type OrderApiResponse = ResponseApi<OrderResponse>;
export type OrderListResponse = ResponseApiWithPagination<OrderResponse[]>;
