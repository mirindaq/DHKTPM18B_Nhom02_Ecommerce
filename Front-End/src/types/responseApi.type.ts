export interface ResponseApi<data> {
  status: number;
  message: string;
  data: data;
  
}

export interface ResponseApiWithPagination<data> {
  message: string;
  status: number;
  data: {
    limit: number;
    page: number;
    totalItem: number;
    totalPage: number;
    data: data;
  };
}
