import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";
import type { ArticleCategory } from "./article-category.type";

export type Article = {
    id: number,
    title: string;
    slug: string;
    thumbnail: string;
    content: string;
    status: boolean;
    createdAt: string;
    modifiedAt: string;
    staffName: string;
    category: ArticleCategory;
}

export type CreateArticleRequest = {
    title: string;
    thumbnail?: string;
    content: string;
    status?: boolean;
    articleCategoryId: number;
};




export type ArticleResponse = ResponseApi<Article>;

export type ArticleListResponse = ResponseApiWithPagination<Article[]>;




