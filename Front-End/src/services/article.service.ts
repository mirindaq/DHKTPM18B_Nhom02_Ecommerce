import axiosClient from "@/configurations/axios.config";
import type {
  CreateArticleRequest,
  ArticleResponse,
  ArticleListResponse,
} from "@/types/article.type";

export const articleService = {
  getArticles: async (
    page = 1,
    limit = 7,
    title = "",
    status: boolean | null = null,
    categoryId: number | null = null,
    createdDate: string | null = null
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (title) params.append("title", title);
    if (status !== null) params.append("status", String(status));
    if (categoryId !== null) params.append("categoryId", String(categoryId));
    if (createdDate) params.append("createdDate", createdDate);

    const response = await axiosClient.get<ArticleListResponse>(
      `/articles?${params.toString()}`
    );
    return response.data;
  },

  getArticleById: async (id: number) => {
    const response = await axiosClient.get<ArticleResponse>(`/articles/${id}`);
    return response.data;
  },

  createArticle: async (request: CreateArticleRequest) => {
    const response = await axiosClient.post<ArticleResponse>("/articles", request);
    return response.data;
  },

  updateArticle: async (id: number, request: CreateArticleRequest) => {
    const response = await axiosClient.put<ArticleResponse>(`/articles/${id}`, request);
    return response.data;
  },

  changeStatusArticle: async (id: number) => {
    await axiosClient.put(`/articles/change-status/${id}`);
  }

};
