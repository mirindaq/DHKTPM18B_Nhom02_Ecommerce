import axiosClient from "@/configurations/axios.config"
import type {
  SupplierRequest,
  SupplierResponse,
  SupplierListResponse,
} from "@/types/supplier.type"

interface GetSuppliersParams {
  page: number
  size: number
  name?: string
  phone?: string
  address?: string
  status?: string
  startDate?: string
  endDate?: string
}

export const supplierService = {
  getSuppliers: async (params: GetSuppliersParams) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    })

    if (params.name) queryParams.append("name", params.name)
    if (params.phone) queryParams.append("phone", params.phone)
    if (params.address) queryParams.append("address", params.address)
    if (params.status) queryParams.append("status", params.status)
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)

    const response = await axiosClient.get<SupplierListResponse>(
      `/suppliers?${queryParams.toString()}`,
    )
    return response.data
  },

  getSupplierById: async (id: string) => {
    const response = await axiosClient.get<SupplierResponse>(`/suppliers/${id}`)
    return response.data
  },

  createSupplier: async (request: SupplierRequest) => {
    const response = await axiosClient.post<SupplierResponse>(
      "/suppliers",
      request,
    )
    return response.data
  },

  updateSupplier: async (id: string, data: SupplierRequest) => {
    const response = await axiosClient.put<SupplierResponse>(
      `/suppliers/${id}`,
      data,
    )
    return response.data
  },

  changeStatusSupplier: async (id: string) => {
    await axiosClient.put(`/suppliers/change-status/${id}`)
  },

  // --- CÁC HÀM XỬ LÝ EXCEL MỚI ---

  /**
   * Tải xuống file mẫu Excel để nhập liệu
   */
  downloadTemplate: async () => {
    const response = await axiosClient.get("/suppliers/template", {
      responseType: "blob", // Quan trọng: Báo cho axios biết đây là file binary
    })
    return response // Trả về response để component xử lý tạo link download
  },

  /**
   * Import dữ liệu từ file Excel
   * @param formData Chứa file excel đã chọn
   */
  importSuppliers: async (formData: FormData) => {
    const response = await axiosClient.post("/suppliers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Quan trọng khi upload file
      },
    })
    return response.data
  },

  /**
   * Xuất dữ liệu hiện tại ra file Excel
   */
  exportSuppliers: async () => {
    const response = await axiosClient.get("/suppliers/export", {
      responseType: "blob", // Quan trọng: Báo cho axios biết đây là file binary
    })
    return response // Trả về response để component xử lý tạo link download
  },
}