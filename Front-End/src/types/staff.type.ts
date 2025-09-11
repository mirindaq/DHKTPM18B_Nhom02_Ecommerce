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

// Bảng trung gian staff-userRole (như backend cung cấp)
export interface StaffUserRole {
  id: number
  role: UserRole
}

// Work status
export type WorkStatus = "ACTIVE" | "INACTIVE" | "PROBATION"

function mapWorkStatusToApi(value: WorkStatus) {
  switch (value) {
    case "ACTIVE": return "ACTIVE" // hoặc "1"
    case "INACTIVE": return "INACTIVE" // hoặc "0"
    case "PROBATION": return "PROBATION"
  }
}

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
  userRole: StaffUserRole[]
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
  roleIds: number[] // backend nhận roleIds
}

export interface UpdateStaffRequest {
  fullName?: string
  phone?: string
  address?: string
  avatar?: string
  dateOfBirth?: string
  joinDate?: string
  workStatus?: WorkStatus
  roleIds?: number[]
}
