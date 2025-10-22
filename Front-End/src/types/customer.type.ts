// ============================================
// 📁 src/types/customer.type.ts
// ============================================

// ====== IMPORT CHUNG ======
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";

// ===================== ADDRESS TYPES =====================

// Dùng khi tạo hoặc cập nhật địa chỉ
export interface AddressRequest {
  subAddress: string;      // Số nhà, tên đường
  wardCode: string;        // Mã phường/xã
  provinceCode: string;    // Mã tỉnh/thành
  fullName: string;        // Họ tên người nhận
  phone: string;           // SĐT người nhận
  isDefault: boolean;      // Có phải địa chỉ mặc định không
  addressName: string;     // Tên địa chỉ (VD: Nhà riêng, Cơ quan...)
}

// Chỉ chi tiết mã khi cần
export type AddressDetail = {
  subAddress: string;
  wardCode: string;
  provinceCode: string;
};

// Dữ liệu backend trả về
export type AddressResponse = {
  [x: string]: any;
  id: number;
  addressName: string;
  province: { code: string; name: string } | null;
  ward: { code: string; name: string } | null;
  fullName: string;
  phone: string;
  subAddress: string;
  wardName: string;      // tên phường/xã
  provinceName: string;  // tên tỉnh/thành
  fullAddress: string;   // ví dụ: "123 Lê Lợi, Phường 1, TP.HCM"
  isDefault: boolean;
};

// ===================== CUSTOMER TYPES =====================

export interface CustomerSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  addresses?: AddressResponse[];
  dateOfBirth?: string | null;
  avatar?: string;
  totalSpending: number;
  rankingName: string;
  totalOrders?: number;
  createdAt: string;
  modifiedAt?: string;
}

// Dùng khi tạo customer mới
export interface CreateCustomerRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string | null;
  avatar: string;
  addresses: AddressRequest[];
}

// Dùng khi cập nhật thông tin
export interface UpdateCustomerProfileRequest {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  avatar?: string;
  addresses?: AddressRequest[]; // ✅ sửa key từ 'address' → 'addresses' để thống nhất
}

// ===================== ORDER + STATISTIC TYPES =====================

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

// ===================== CUSTOMER DETAIL =====================

export type CustomerDetail = CustomerSummary & {
  lastActivityDate: string;
  orders: Order[];
  mostPurchased: MostPurchasedProduct[];
};

// ===================== API RESPONSE TYPES =====================

export type CustomerResponse = ResponseApi<CustomerSummary>;
export type CustomerDetailResponse = ResponseApi<CustomerDetail>;
export type CustomerListResponse = ResponseApiWithPagination<CustomerSummary[]>;
export type AddressListResponse = ResponseApi<AddressResponse[]>;
export type AddressSingleResponse = ResponseApi<AddressResponse>;
