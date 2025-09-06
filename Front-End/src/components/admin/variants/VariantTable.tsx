import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Power, PowerOff, Loader2 } from "lucide-react"
import type { Variant } from "@/types/variant.type"

interface VariantTableProps {
  variants: Variant[]
  onEdit: (variant: Variant) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  isLoading?: boolean
  onSearch: (searchTerm: string) => void
  currentPage?: number
  pageSize?: number
}

export default function VariantTable({
  variants,
  onEdit,
  onDelete,
  onToggleStatus,
  onSearch,
  isLoading,
  currentPage = 1,
  pageSize = 7
}: VariantTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatVariantValues = (variantValues: any[]) => {
    if (!variantValues || variantValues.length === 0) return "Không có"
    const variantValuesActive = variantValues.filter(value => value.status)
    return variantValuesActive
      .slice(0, 3).map(value => value.value).join(", ") +
      (variantValuesActive.length > 3 ? ` +${variantValuesActive.length - 3}` : "")
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(searchTerm)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm variant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
              onKeyDown={handleSearch}
            />
          </div>
          <Button
            onClick={() => onSearch(searchTerm)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold text-gray-900">{variants.length}</span> variant
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Tên variant</TableHead>
              <TableHead className="font-semibold text-gray-700">Giá trị variant</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày tạo</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {searchTerm ? "Không tìm thấy variant nào" : "Chưa có variant nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Hãy thêm variant đầu tiên"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              variants.map((variant, index) => (
                <TableRow key={variant.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{variant.name}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs" title={formatVariantValues(variant.variantValues)}>
                    {formatVariantValues(variant.variantValues)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.status ? "default" : "secondary"} className={
                      variant.status
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }>
                      {variant.status ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(variant.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(variant)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(variant.id)}
                        className={`${variant.status
                          ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                          : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                          }`}
                        disabled={isLoading}
                      >
                        {variant.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(variant.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
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
