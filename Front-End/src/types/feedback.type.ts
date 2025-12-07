import type { ResponseApi } from "./responseApi.type";

export type CreateFeedbackRequest = {
  orderId: number;
  productVariantId: number;
  rating: number;
  comment?: string;
  imageUrls?: string[];
};

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

export type RatingStatistics = {
  productId: number;
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
};

export type FeedbackResponse = ResponseApi<Feedback>;

export type RatingStatisticsResponse = ResponseApi<RatingStatistics>;

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
