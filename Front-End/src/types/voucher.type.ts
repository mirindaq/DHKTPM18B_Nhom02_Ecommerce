import type { RankVoucher } from "./ranking.type";
import type {
  ResponseApi,
  ResponseApiWithPagination,
} from "./responseApi.type";

export type VoucherType = "ALL" | "GROUP" | "RANK";

export type VoucherCustomerStatus = "DRAFT" | "SENT";

export type VoucherCustomer = {
  id: number;
  customerId: number;
  customerName: string;
  email: string;
  code: string;
  voucherCustomerStatus: VoucherCustomerStatus;
};



export type Voucher = {
  id: number;
  code: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  active: boolean;
  voucherType: VoucherType;
  voucherCustomers: VoucherCustomer[];
  ranking: RankVoucher;
};

export type VoucherCustomerRequest = {
  customerId: number;
};

export type CreateVoucherRequest = {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  discount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  active: boolean;
  voucherType: VoucherType;
  code?: string;
  voucherCustomers?: VoucherCustomerRequest[];
  rankId?: number;
};

export type UpdateVoucherRequest = {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  discount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  active: boolean;
  code?: string;
  voucherCustomers?: VoucherCustomerRequest[];
  rankId?: number;
};

export type VoucherResponse = ResponseApi<Voucher>;

export type VoucherListResponse = ResponseApiWithPagination<Voucher[]>;

export type VoucherAvailableResponse = {
  id: number;
  code: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  minOrderAmount: number;
  maxDiscountAmount: number;
  discount: number;
  voucherType: VoucherType;
};
