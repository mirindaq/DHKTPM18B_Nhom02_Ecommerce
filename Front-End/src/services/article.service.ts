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

    const url = `/articles?${params.toString()}`;
    console.log("🌐 API Request URL:", url);
    
    const response = await axiosClient.get<ArticleListResponse>(url);
    console.log("✅ API Response:", response.data);
    return response.data;
  },

  getArticleById: async (id: number) => {
    const response = await axiosClient.get<ArticleResponse>(`/articles/${id}`);
    return response.data;
  },

  getArticleBySlug: async (slug: string) => {
    const response = await axiosClient.get<ArticleResponse>(`/articles/slug/${slug}`);
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
  },

// NEW: Get articles by category slug
  getArticlesByCategory: async (
    categorySlug: string,
    page = 1,
    limit = 10
  ) => {
    // First get category by slug
    const categoryResponse = await axiosClient.get(`/article-categories/slug/${categorySlug}`);
    const categoryId = categoryResponse.data.id;
    
    // Then get articles by category ID
    return articleService.getArticles(page, limit, "", true, categoryId, null);
  },

  // NEW: Get related articles (same category)
  getRelatedArticles: async (
    articleId: number,
    categoryId: number,
    limit = 3
  ) => {
    const response = await articleService.getArticles(1, limit + 1, "", true, categoryId, null);
    // Filter out current article
    return (response.data?.data ?? []).filter((article: { id: number; }) => article.id !== articleId).slice(0, limit);
  },
  
};

