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

export const customerService = {
  getCustomers: async (page: number, size: number, search: string, active: string) => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        search: search,
    });

    // Chỉ thêm tham số `status` vào URL nếu nó không phải là rỗng (trường hợp "all")
    if (active) {
        params.append('status', active);
    }
    
    const response = await axiosClient.get<CustomerListResponse>(`/customers?${params.toString()}`);
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
