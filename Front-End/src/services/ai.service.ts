import axiosClient from "@/configurations/axios.config";

export interface ChatAIRequest {
  message: string;
  customerId: number | null; // null nếu chưa đăng nhập
  sessionId: string; // UUID để track conversation
}

export interface ChatAIResponse {
  message: string;
  role: string;
}

export interface AIApiResponse {
  status: number;
  message: string;
  data: ChatAIResponse;
}

export const aiService = {
  chat: async (request: ChatAIRequest) => {
    const response = await axiosClient.post<AIApiResponse>("/ai/chat", request);
    return response.data;
  },
};

