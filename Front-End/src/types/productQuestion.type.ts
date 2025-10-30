import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type ProductQuestionAnswer = {
  id: number;
  userName: string;
  content: string;
  status: boolean;
  admin: boolean;
  createdAt?: string;
};

export type ProductQuestion = {
  id: number;
  content: string;
  status: boolean;
  userName: string;
  answers: ProductQuestionAnswer[];
  createdAt?: string;
};

export type ProductQuestionAddRequest = {
  content: string;
  productId: number;
};

export type ProductQuestionAnswerAddRequest = {
  content: string;
  productQuestionId: number;
};

export type ProductQuestionResponse = ResponseApi<ProductQuestion>;
export type ProductQuestionListResponse = ResponseApiWithPagination<ProductQuestion[]>;
