import axiosClient from '@/configurations/axios.config';
import type { 
  CreateCustomerRequest, 
  CustomerResponse, 
  CustomerListResponse ,
  CustomerDetailResponse ,
  UpdateCustomerProfileRequest
} from '@/types/customer.type';

// src/services/customer.service.ts

// ... (các import và các hàm khác của bạn)

interface GetCustomersParams {
  page: number;
  size: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
}
export const customerService = {
  getCustomers: async ({
    page,
    size,
    name,
    email,
    phone,
    status,
    startDate,
    endDate,
  }: GetCustomersParams & { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: size.toString(),
    });

    if (name) params.append("name", name);
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);

    // Status: append ngay cả khi false
    if (status !== null && status !== undefined) {
      params.append("status", status.toString());
    }

    // Date filters
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosClient.get<CustomerListResponse>(
      `/customers?${params.toString()}`
    );
    return response.data;
  },




getCustomerDetails: async (id: number) => {
  const response = await axiosClient.get<CustomerDetailResponse>(`/customers/${String(id)}`);
  return response.data;
},

  // Lấy chi tiết khách hàng theo ID
  getCustomerById: async (id: number) => {
    const response = await axiosClient.get<CustomerResponse>(`/customers/${id}`);
    return response.data;
  },

  // Tạo mới khách hàng
  createCustomer: async (request: CreateCustomerRequest) => {
    const response = await axiosClient.post<CustomerResponse>('/customers', request);
    return response.data;
  },

  // Cập nhật thông tin khách hàng
  updateCustomer: async (id: number, data: UpdateCustomerProfileRequest) => {
    const response = await axiosClient.put<CustomerResponse>(`/customers/${id}`, data);
    return response.data;
  },
  // Thay đổi trạng thái khách hàng (active/inactive)
  changeStatusCustomer: async (id: number) => {
    await axiosClient.put(`/customers/change-status/${id}`);
  },

  // Xóa khách hàng (nếu backend hỗ trợ)
  deleteCustomer: async (id: number) => {
    await axiosClient.delete(`/customers/${id}`);
  }
};
