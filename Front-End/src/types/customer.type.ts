import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";


export type CustomerSummary = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean; // Đổi `active` thành `status` để khớp với code cũ
  registerDate: string;
  
  // Các trường profile để điền form sửa
  dateOfBirth?: string | null;
  avatar?: string;

  // Các trường thống kê
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  modifiedAt: string;
};
export type UpdateCustomerProfileRequest = {
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  dateOfBirth?: string | null;
  avatar?: string;
};

export type Order = {
  id: string; // Hoặc number tùy backend
  date: string;
  total: number;
  status: "delivered" | "processing" | "cancelled";
};
export type MostPurchasedProduct = {
  name: string;
  count: number;
};

export type CreateCustomerRequest = {
  fullName: string;
  phone: string;
  password: string;  // nên để bắt buộc khi tạo mới
  email: string;
  registerDate: Date | null;
  address: string;
  dateOfBirth?: string | null;  // thêm ngày sinh
  avatar?: string;             // thêm avatar (nếu cần)
};

export type CustomerDetail = CustomerSummary  & {
  lastActivityDate: string; 
  orders: Order[];
  mostPurchased: MostPurchasedProduct[];
};
export type CustomerResponse = ResponseApi<CustomerSummary>;
export type CustomerDetailResponse = ResponseApi<CustomerDetail>;
export type CustomerListResponse = ResponseApiWithPagination<CustomerSummary []>;
