import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Power, PowerOff, Loader2, Search } from "lucide-react"
import type { Supplier } from "@/types/supplier.type"

interface SupplierTableProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onToggleStatus: (supplier: Supplier) => void
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
}

export default function SupplierTable({
  suppliers,
  onEdit,
  onToggleStatus,
  isLoading = false,
  currentPage = 1,
  pageSize = 7,
}: SupplierTableProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Tổng cộng:{" "}
        <span className="font-semibold text-gray-900">{suppliers.length}</span>{" "}
        nhà cung cấp
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-center font-semibold">STT</TableHead>
              <TableHead className="font-semibold">Tên Nhà cung cấp</TableHead>
              <TableHead className="font-semibold">Số điện thoại</TableHead>
              <TableHead className="font-semibold">Địa chỉ</TableHead>
              <TableHead className="font-semibold text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-center">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        Chưa có nhà cung cấp nào
                      </p>
                      <p className="text-sm text-gray-400">
                        Hãy thêm nhà cung cấp đầu tiên
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier, index) => (
                <TableRow
                  key={supplier.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {supplier.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {supplier.phone}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {supplier.address || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        supplier.status
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {supplier.status ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(supplier)}
                        disabled={isLoading}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(supplier)}
                        disabled={isLoading}
                        className={
                          supplier.status
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }
                      >
                        {supplier.status ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
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