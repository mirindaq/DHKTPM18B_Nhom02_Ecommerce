import type { CustomerSummary } from "@/types/customer.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";
import type { ProductVariantResponse } from "@/types/product.type";

export type PaymentMethod = "CASH_ON_DELIVERY" | "VN_PAY" | "PAY_OS";

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
  status: string;
  note: string;
  paymentMethod: PaymentMethod;
  isPickup: boolean;
  totalPrice: number;
  totalDiscount: number;
  finalTotalPrice: number;
  customer: CustomerSummary;
  orderDetails: OrderDetailResponse[];
}


interface OrderDetailResponse {
  id: number;
  price: number;
  quantity: number;
  discount: number;
  finalPrice: number;
  productVariant: ProductVariantResponse
}

export type OrderApiResponse = ResponseApi<OrderResponse>;
export type OrderListResponse = ResponseApiWithPagination<OrderResponse[]>;
