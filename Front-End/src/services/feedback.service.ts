import axiosClient from '@/configurations/axios.config';
import type {
  FeedbackResponse,
  FeedbackListResponse,
  FeedbackFilters
} from '@/types/feedback.type';

export const feedbackService = {
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
