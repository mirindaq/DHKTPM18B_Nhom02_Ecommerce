import type { ResponseApi } from "./responseApi.type";

export type Feedback = {
  id: number;
  orderId: number;
  productVariantId: number;
  productName: string;
  productImage: string;
  customerId: number;
  customerName: string;
  rating: number;
  comment: string;
  status: boolean | null;
  imageUrls: string[];
  createdAt: string;
};

export type FeedbackResponse = ResponseApi<Feedback>;

export type FeedbackListResponse = ResponseApi<{
  content: Feedback[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}>;

export type FeedbackFilters = {
  rating?: number;
  status?: boolean | null;
  fromDate?: string;
  toDate?: string;
};
