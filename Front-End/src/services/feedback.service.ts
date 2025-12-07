import axiosClient from '@/configurations/axios.config';
import type {
  FeedbackResponse,
  FeedbackListResponse,
  FeedbackFilters,
  CreateFeedbackRequest,
  Feedback,
  RatingStatistics
} from '@/types/feedback.type';
import type { ResponseApi } from '@/types/responseApi.type';

export const feedbackService = {
  // User APIs
  createFeedback: async (request: CreateFeedbackRequest) => {
    const response = await axiosClient.post<ResponseApi<Feedback>>('/feedbacks', request);
    return response.data;
  },

  checkIfReviewed: async (orderId: number, productVariantId: number) => {
    const response = await axiosClient.get<ResponseApi<boolean>>(
      `/feedbacks/check?orderId=${orderId}&productVariantId=${productVariantId}`
    );
    return response.data;
  },

  getFeedbackDetail: async (orderId: number, productVariantId: number) => {
    const response = await axiosClient.get<ResponseApi<Feedback>>(
      `/feedbacks/detail?orderId=${orderId}&productVariantId=${productVariantId}`
    );
    return response.data;
  },

  // Product page APIs (Public)
  getFeedbacksByProduct: async (productId: number, page: number = 1, size: number = 5, rating?: number) => {
    let url = `/feedbacks/product/${productId}?page=${page}&size=${size}`;
    if (rating !== undefined && rating !== null) {
      url += `&rating=${rating}`;
    }
    const response = await axiosClient.get<FeedbackListResponse>(url);
    return response.data;
  },

  getRatingStatistics: async (productId: number) => {
    const response = await axiosClient.get<ResponseApi<RatingStatistics>>(
      `/feedbacks/product/${productId}/statistics`
    );
    return response.data;
  },

  // Admin APIs
  getAllFeedbacks: async (page: number = 1, size: number = 10, filters?: FeedbackFilters) => {
    let url = `/feedbacks?page=${page}&size=${size}`;

    if (filters?.rating !== undefined) {
      url += `&rating=${filters.rating}`;
    }
    if (filters?.status !== undefined && filters?.status !== null) {
      url += `&status=${filters.status}`;
    }
    if (filters?.fromDate) {
      url += `&fromDate=${filters.fromDate}`;
    }
    if (filters?.toDate) {
      url += `&toDate=${filters.toDate}`;
    }

    const response = await axiosClient.get<FeedbackListResponse>(url);
    return response.data;
  }, getFeedbackById: async (id: number) => {
    const response = await axiosClient.get<FeedbackResponse>(`/feedbacks/${id}`);
    return response.data;
  },

  changeStatusFeedback: async (id: number) => {
    await axiosClient.put(`/feedbacks/change-status/${id}`);
  },

  deleteFeedback: async (id: number) => {
    await axiosClient.delete(`/feedbacks/${id}`);
  },
};
