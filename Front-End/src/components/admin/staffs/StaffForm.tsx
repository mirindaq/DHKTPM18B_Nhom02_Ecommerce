// src/components/admin/staffs/StaffForm.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { CreateStaffRequest, UpdateStaffRequest, Staff, UserRole, WorkStatus } from "@/types/staff.type"

interface StaffFormProps {
  staff?: Staff | null
  roles: UserRole[] // danh sách role từ backend
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => void
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export default function StaffForm({
  staff,
  roles,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: StaffFormProps) {
  const [formData, setFormData] = useState<CreateStaffRequest>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
    active: true,
    joinDate: "",
    workStatus: "ACTIVE",
    roleIds: [],
  })

  useEffect(() => {
    if (staff) {
      setFormData((prev) => ({
        ...prev,
        fullName: staff.fullName || "",
        email: staff.email || "",
        password: "", // không gửi mật khẩu khi update
        phone: staff.phone || "",
        address: staff.address || "",
        avatar: staff.avatar || "",
        dateOfBirth: staff.dateOfBirth || "",
        active: staff.active ?? true,
        joinDate: staff.joinDate || "",
        workStatus: (staff.workStatus as WorkStatus) || "ACTIVE",
        roleIds: staff.userRole?.map((ur) => ur.role.id) || [],
      }))
    } else {
      // nếu là create -> reset
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        avatar: "",
        dateOfBirth: "",
        active: true,
        joinDate: "",
        workStatus: "ACTIVE",
        roleIds: [],
      }))
    }
  }, [staff])

  const handleChange = (field: keyof CreateStaffRequest | keyof UpdateStaffRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setFormData((prev) => {
      const roleIds = checked ? [...(prev.roleIds || []), roleId] : (prev.roleIds || []).filter((id) => id !== roleId)
      return { ...prev, roleIds }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      const updateData: UpdateStaffRequest = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
        dateOfBirth: formData.dateOfBirth,
        active: formData.active,
        joinDate: formData.joinDate,
        workStatus: formData.workStatus,
        roleIds: formData.roleIds,
      }
      onSubmit(updateData)
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
      </div>

      {!isEdit && (
        <>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="address">Địa chỉ</Label>
        <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="avatar">Ảnh đại diện (URL)</Label>
        <Input id="avatar" value={formData.avatar} onChange={(e) => handleChange("avatar", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
        <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="joinDate">Ngày vào làm</Label>
        <Input id="joinDate" type="date" value={formData.joinDate} onChange={(e) => handleChange("joinDate", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="workStatus">Trạng thái làm việc</Label>
        <Select value={formData.workStatus as WorkStatus} onValueChange={(v: WorkStatus) => handleChange("workStatus", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Đang làm</SelectItem>
            <SelectItem value="INACTIVE">Nghỉ việc</SelectItem>
            <SelectItem value="PROBATION">Thử việc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Vai trò</Label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center space-x-2">
              <Checkbox checked={(formData.roleIds || []).includes(role.id)} onCheckedChange={(checked) => handleRoleChange(role.id, checked === true)} />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox checked={formData.active} onCheckedChange={(checked) => handleChange("active", checked === true)} />
        <Label>Hoạt động</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu"}</Button>
      </div>
    </form>
  )
}
