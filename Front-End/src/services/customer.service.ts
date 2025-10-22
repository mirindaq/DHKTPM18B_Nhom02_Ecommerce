import axiosClient from '@/configurations/axios.config';
import type { 
  CreateCustomerRequest, 
  CustomerResponse, 
  CustomerListResponse,
  CustomerDetailResponse,
  UpdateCustomerProfileRequest
} from '@/types/customer.type';

// --------------------------------------------------------
// 🌍 CÁC KIỂU DỮ LIỆU PHỤ CHO ĐỊA CHỈ
// --------------------------------------------------------
export interface ProvinceFE { 
  code: string; 
  name: string; 
}

export interface WardFE { 
  code: string; 
  name: string; 
  provinceCode: string;
}

export interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  subAddress: string;
  wardName: string;
  provinceName: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  subAddress: string;
  wardCode: string;
  provinceCode: string;
  isDefault: boolean;
  fullName: string;
  phone: string;
  addressName: string;
}

// --------------------------------------------------------
// ⚙️ THAM SỐ LỌC KHÁCH HÀNG
// --------------------------------------------------------
interface GetCustomersParams {
  page: number;
  size: number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  rank?: string | null; 
  startDate?: string;
  endDate?: string;
}

// --------------------------------------------------------
// 🧩 SERVICE CHÍNH CHO KHÁCH HÀNG
// --------------------------------------------------------
export const customerService = {
  /**
   * ✅ Lấy danh sách khách hàng (có filter + phân trang)
   */
  getCustomers: async (params: GetCustomersParams) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.size.toString(),
    });

    if (params.name) queryParams.append('name', params.name);
    if (params.email) queryParams.append('email', params.email);
    if (params.phone) queryParams.append('phone', params.phone);
    if (params.status) queryParams.append('status', params.status);
    if (params.rank) queryParams.append('rank', params.rank);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await axiosClient.get<CustomerListResponse>(
      `/customers?${queryParams.toString()}`
    );
    return response.data;
  },

  
  

  getAddressesByCustomer: async (customerId: number): Promise<AddressResponse[]> => {
    const response = await axiosClient.get<{ data: AddressResponse[] }>(
      `/customers/${customerId}/addresses`
    );
    return response.data.data;
  },

  /**
   * ✅ Thêm địa chỉ cho khách hàng cụ thể
   */
  createAddressForCustomer: async (
    customerId: number,
    request: CreateAddressRequest
  ): Promise<AddressResponse> => {
    const response = await axiosClient.post<{ data: AddressResponse }>(
      `/customers/${customerId}/addresses`,
      request
    );
    return response.data.data;
  },

  /**
   * ✅ Lấy chi tiết khách hàng (bao gồm đơn hàng, thống kê, ...)
   */
  getCustomerDetails: async (id: number) => {
    const response = await axiosClient.get<CustomerDetailResponse>(`/customers/${id}`);
    return response.data;
  },

  /**
   * ✅ Lấy thông tin khách hàng cơ bản
   */
  getCustomerById: async (id: number) => {
    const response = await axiosClient.get<CustomerResponse>(`/customers/${id}`);
    return response.data;
  },

  /**
   * ✅ Tạo mới khách hàng
   */
  createCustomer: async (request: CreateCustomerRequest) => {
    const response = await axiosClient.post<CustomerResponse>('/customers', request);
    return response.data;
  },

  /**
   * ✅ Cập nhật thông tin khách hàng
   */
  updateCustomer: async (id: number, data: UpdateCustomerProfileRequest) => {
    const response = await axiosClient.put<CustomerResponse>(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * ✅ Thay đổi trạng thái hoạt động (active/inactive)
   */
  changeStatusCustomer: async (id: number) => {
    await axiosClient.put(`/customers/change-status/${id}`);
  },

  /**
   * ✅ Xóa khách hàng
   */
  deleteCustomer: async (id: number) => {
    await axiosClient.delete(`/customers/${id}`);
  },

  deleteAddressForCustomer: async (customerId: number, addressId: number): Promise<void> => {
    await axiosClient.delete(`/customers/${customerId}/addresses/${addressId}`);
  },
  /**
 * ✅ Cập nhật địa chỉ của khách hàng
 */
updateAddress: async (
  customerId: number,
  addressId: number,
  request: CreateAddressRequest
): Promise<AddressResponse> => {
  const response = await axiosClient.put<{ data: AddressResponse }>(
    `/customers/${customerId}/addresses/${addressId}`,
    request
  );
  return response.data.data;
},

};
