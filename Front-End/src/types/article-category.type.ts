// src/types/article-category.type.ts
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type ArticleCategory = {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  modifiedAt: string;
};

export type CreateArticleCategoryRequest = {
  title: string;
};


export type ArticleCategoryResponse = ResponseApi<ArticleCategory>;

export type ArticleCategoryListResponse = ResponseApiWithPagination<ArticleCategory[]>;
