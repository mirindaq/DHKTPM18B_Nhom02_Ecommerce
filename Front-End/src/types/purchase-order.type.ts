import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type PurchaseOrderStatus = "PENDING" | "COMPLETED" | "CANCELED";

export interface PurchaseOrderDetailRequest {
  productVariantId: number;
  quantity: number;
  price: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  note?: string;
  details: PurchaseOrderDetailRequest[];
}

export interface ProductVariantForPurchase {
  id: number;
  sku: string;
  price: number;
  stock: number;
  productName: string;
  productThumbnail: string;
  brandName: string;
  categoryName: string;
  variantValues: string;
}

export interface PurchaseOrderItem {
  id: number;
  quantity: number;
  price: number;
  totalPrice: number;
  productVariant: ProductVariantForPurchase;
}

export interface SupplierInfo {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface StaffInfo {
  id: number;
  name: string;
  email: string;
}

export interface PurchaseOrder {
  id: number;
  purchaseDate: string;
  totalPrice: number;
  note?: string;
  supplier: SupplierInfo;
  staff: StaffInfo;
  details: PurchaseOrderItem[];
}

export interface PurchaseOrderFilter {
  supplierId?: string;
  supplierName?: string;
  startDate?: string;
  endDate?: string;
}

export type PurchaseOrderResponse = ResponseApi<PurchaseOrder>;
export type PurchaseOrderListResponse = ResponseApiWithPagination<PurchaseOrder[]>;
