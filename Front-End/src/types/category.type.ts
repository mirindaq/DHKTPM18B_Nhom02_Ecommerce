
import type { Attribute } from "./attribute.type";
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";


export type CreateAttributeRequest = {
  name: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  image: string;
  status: boolean;
  createdAt: string;
  modifiedAt: string; 
  attributes: Attribute[];
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  image?: string;
  status?: boolean;
  attributes?: CreateAttributeRequest[];
};

export type CategoryResponse = ResponseApi<Category>;

export type CategoryListResponse = ResponseApiWithPagination<Category[]>;
