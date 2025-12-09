// src/types/staff.type.ts

// Generic wrapper (backend trả về { status, message, data })
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

// Role
export interface UserRole {
  id: number
  name: string
}

// Role Response (đồng bộ với backend RoleResponse)
export interface RoleResponse {
  id: number
  name: string
  description?: string
}

// Work status
export type WorkStatus = "ACTIVE" | "INACTIVE" | "PROBATION"

// Staff entity (đồng bộ với backend DTO)
export interface Staff {
  id: number
  fullName: string
  email: string
  phone: string
  address?: string
  avatar?: string
  dateOfBirth?: string
  joinDate?: string
  active: boolean
  workStatus?: WorkStatus
  role?: RoleResponse
  createdAt?: string
  modifiedAt?: string
}

// Pagination payload that backend trả ra trong data của getStaffs
export interface StaffListPayload {
  data: Staff[]
  total: number
  totalPage: number
  currentPage: number
  pageSize: number
}

// Requests
export interface CreateStaffRequest {
  fullName: string
  email: string
  password: string
  phone: string
  address?: string
  avatar?: string
  dateOfBirth?: string
  joinDate?: string
  active: boolean
  workStatus?: WorkStatus
  roleId: number // backend nhận roleId
}

export interface UpdateStaffRequest {
  fullName?: string
  phone?: string
  address?: string
  avatar?: string
  dateOfBirth?: string
  joinDate?: string
  workStatus?: WorkStatus
  roleId?: number
}
