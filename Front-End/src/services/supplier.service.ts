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

  // Excel operations
  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosClient.get("/suppliers/template", {
      responseType: "blob",
    })
    return response.data
  },

  importSuppliers: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await axiosClient.post("/suppliers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for large files
    })
    return response.data
  },

  exportSuppliers: async (): Promise<Blob> => {
    const response = await axiosClient.get("/suppliers/export", {
      responseType: "blob",
    })
    return response.data
  },
}