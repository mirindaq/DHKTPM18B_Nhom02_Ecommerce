import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Power, PowerOff, Loader2 } from "lucide-react"
import type { CustomerSummary } from "@/types/customer.type"

interface CustomerTableProps {
  customers: CustomerSummary[]
  onEdit: (customer: CustomerSummary) => void
  onToggleStatus: (id: number) => void
  isLoading?: boolean
  onSearch: (searchTerm: string) => void
  currentPage?: number
  pageSize?: number
}

export default function CustomerTable({ 
  customers, 
  onEdit, 
  onToggleStatus, 
  onSearch,
  isLoading,
  currentPage = 1,
  pageSize = 7
}: CustomerTableProps) {
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
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              onKeyDown={handleSearch}
            />
          </div>
          <Button
            onClick={() => onSearch(searchTerm)}
            disabled={isLoading}
            className="bg-blue-600 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold text-gray-900">{customers.length}</span> khách hàng
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>STT</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? "Không tìm thấy khách hàng nào" : "Chưa có khách hàng nào"}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, index) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-semibold">{customer.fullName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    <Badge variant={customer.active ? "default" : "secondary"} className={
                      customer.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }>
                      {customer.active ? "Hoạt động" : "Ngưng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(customer.registerDate)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        className="border-blue-200 text-blue-600"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(customer.id)}
                        className={customer.active 
                          ? "border-orange-200 text-orange-600" 
                          : "border-green-200 text-green-600"}
                        disabled={isLoading}
                      >
                        {customer.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
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
