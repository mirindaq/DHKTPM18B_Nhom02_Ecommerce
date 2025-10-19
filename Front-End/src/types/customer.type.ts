import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

export type CustomerSummary = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean; // trạng thái
  registerDate: string;

  // Các trường profile
  dateOfBirth?: string | null;
  avatar?: string;

  // Các trường thống kê
  totalSpending: number;   // ✅ khớp với backend
  rankingName: string;     // ✅ thêm mới
  totalOrders?: number;    // optional nếu backend chưa trả
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
  id: string | number;
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
  password: string;
  email: string;
 
  dateOfBirth?: string | null;
  avatar?: string;

  // ✅ Thay vì chỉ 1 chuỗi address, ta chia nhỏ chi tiết
  address: {
    subAddress: string;      // ví dụ: "123 Lê Lợi"
    wardCode: string;        // mã phường, ví dụ: "WARD_001"
    provinceCode: string;
  };
};

export type CustomerDetail = CustomerSummary & {
  lastActivityDate: string;
  orders: Order[];
  mostPurchased: MostPurchasedProduct[];
};

export type CustomerResponse = ResponseApi<CustomerSummary>;
export type CustomerDetailResponse = ResponseApi<CustomerDetail>;
export type CustomerListResponse = ResponseApiWithPagination<CustomerSummary[]>;
