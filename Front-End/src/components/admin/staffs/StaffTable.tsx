// src/components/admin/staffs/StaffTable.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Power, PowerOff, Loader2 } from "lucide-react"
import type { Staff } from "@/types/staff.type"

interface StaffTableProps {
  staffs: Staff[]
  onEdit: (staff: Staff) => void
  onDelete?: (id: number) => void
  onToggleStatus: (id: number) => void
  onSearch: (searchTerm: string) => void
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
}

export default function StaffTable({
  staffs,
  onEdit,
  onDelete,
  onToggleStatus,
  onSearch,
  isLoading = false,
  currentPage = 1,
  pageSize = 7
}: StaffTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSearch(searchTerm)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Tìm kiếm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} disabled={isLoading} className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <Button onClick={() => onSearch(searchTerm)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-4">
            <Search className="h-4 w-4 mr-2" />Tìm kiếm
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold text-gray-900">{staffs.length}</span> nhân viên
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-center font-semibold">STT</TableHead>
              <TableHead className="font-semibold">Avatar</TableHead>
              <TableHead className="font-semibold">Họ tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">SĐT</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Ngày vào</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : staffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-24 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">Chưa có nhân viên nào</p>
                      <p className="text-sm text-gray-400">Hãy thêm nhân viên đầu tiên</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff, index) => (
                <TableRow key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="text-center font-medium text-gray-600">{(currentPage - 1) * pageSize + index + 1}</TableCell>

                  <TableCell>
                    <div className="w-12 h-12 rounded-full overflow-hidden border">
                      <img src={staff.avatar || ""} alt={staff.fullName} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-gray-900">{staff.fullName}</TableCell>
                  <TableCell className="text-gray-600">{staff.email}</TableCell>
                  <TableCell className="text-gray-600">{staff.phone || "—"}</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {staff.userRole?.length ? staff.userRole.map((ur) => (
                        <Badge key={ur.id} className="bg-purple-100 text-purple-800 border-purple-200">{ur.role?.name}</Badge>
                      )) : <span className="text-gray-400 text-sm">Chưa phân quyền</span>}
                    </div>
                  </TableCell>

                  <TableCell className="text-gray-600">{formatDate(staff.joinDate)}</TableCell>

                  <TableCell>
                    <Badge className={staff.active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                      {staff.active ? "Hoạt động" : "Ngừng"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(staff)} disabled={isLoading} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"><Edit className="h-4 w-4" /></Button>

                      <Button variant="outline" size="sm" onClick={() => onToggleStatus(staff.id)} disabled={isLoading} className={staff.active ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300" : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"}>
                        {staff.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
