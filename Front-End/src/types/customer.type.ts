
import type { ResponseApi, ResponseApiWithPagination } from "./responseApi.type";


export interface AddressRequest {
  subAddress: string;     
  wardCode: string;       
  provinceCode: string;    
  fullName: string;        
  phone: string;           
  isDefault: boolean;      
  addressName: string;     
}
export interface AddressFormData {
  id: number;             
  customerId?: number;    
  subAddress: string;     
  wardCode: string;       
  provinceCode: string;   
  fullName: string;       
  phone: string;          
  isDefault: boolean;     
  addressName: string;    
}
// Chỉ chi tiết mã khi cần
export type AddressDetail = {
  subAddress: string;
  wardCode: string;
  provinceCode: string;
};


export type AddressResponse = {
  id: number;
  addressName: string;
  province: { code: string; name: string } | null;
  ward: { code: string; name: string } | null;
  fullName: string;
  phone: string;
  subAddress: string;
  wardName: string;      
  provinceName: string;  
  fullAddress: string;   
  isDefault: boolean;
};



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


export interface CreateCustomerRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string | null;
  avatar: string;
  addresses: AddressRequest[];
}


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
