// src/services/staff.service.ts
import axiosClient from "@/configurations/axios.config"
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  Staff,
  StaffListPayload,
  UserRole,
  ApiResponse,
} from "@/types/staff.type"

// NOTE:
// Backend returns ResponseSuccess<T> where T is the payload in .data
// This service unwraps response.data.data and returns the payload directly.

export const staffService = {
  // Lấy danh sách staff: trả về StaffListPayload (đã unwrap)
  getStaffs: async (page: number = 1, size: number = 7, params : Record<string,string> ): Promise<StaffListPayload> => {
    const response = await axiosClient.get<ApiResponse<StaffListPayload>>(
      `/staffs?page=${page}&size=${size}`, {
        params: params
      }
    )
    return response.data.data
  },

  // Lấy chi tiết staff theo id => trả về Staff (unwrap)
  getStaffById: async (id: number): Promise<Staff> => {
    const response = await axiosClient.get<ApiResponse<Staff>>(`/staffs/${id}`)
    return response.data.data
  },

  // Tạo staff => trả về Staff
  createStaff: async (request: CreateStaffRequest): Promise<Staff> => {
    const response = await axiosClient.post<ApiResponse<Staff>>("/staffs", request)
    return response.data.data
  },

  // Cập nhật staff => trả về Staff
  updateStaff: async (id: number, request: UpdateStaffRequest): Promise<Staff> => {
    const response = await axiosClient.put<ApiResponse<Staff>>(`/staffs/${id}`, request)
    return response.data.data
  },

  // Thay đổi active/inactive (không trả payload)
  changeActive: async (id: number): Promise<void> => {
    await axiosClient.put(`/staffs/change-active/${id}`)
  },

  // Lấy danh sách roles => trả về UserRole[]
  getRolesForAdmin: async (): Promise<UserRole[]> => {
    const response = await axiosClient.get<ApiResponse<UserRole[]>>("/roles/for-admin")
    return response.data.data
  },
}
