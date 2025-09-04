export interface ResponseApi<data> {
  status: number;
  message: string;
  data: data;
}

export interface ResponseApiWithPagination<data> {
  status: number;
  message: string;
  data: {
    limit: number;
    page: number;
    totalItem: number;
    totalPage: number;
    data: data;
  };
}
