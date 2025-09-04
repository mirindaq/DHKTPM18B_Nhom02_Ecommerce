import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye,   Mail, Phone, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  joinDate: string
  lastOrderDate?: string
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    totalOrders: 15,
    totalSpent: 125000000,
    status: "active",
    joinDate: "2023-01-15",
    lastOrderDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    totalOrders: 8,
    totalSpent: 67000000,
    status: "active",
    joinDate: "2023-03-20",
    lastOrderDate: "2024-01-16"
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0555666777",
    address: "789 Đường DEF, Quận 3, TP.HCM",
    totalOrders: 3,
    totalSpent: 18000000,
    status: "active",
    joinDate: "2023-06-10",
    lastOrderDate: "2024-01-17"
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "0111222333",
    address: "321 Đường GHI, Quận 4, TP.HCM",
    totalOrders: 0,
    totalSpent: 0,
    status: "inactive",
    joinDate: "2023-09-05"
  }
]

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }


  return (
    <div className="space-y-3 p-2">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý khách hàng</h1>
        <p className="text-lg text-gray-600">
          Quản lý thông tin và theo dõi hoạt động của khách hàng
        </p>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={16}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Khách hàng</TableHead>
              <TableHead className="font-semibold text-gray-700">Liên hệ</TableHead>
              <TableHead className="font-semibold text-gray-700">Địa chỉ</TableHead>
              <TableHead className="font-semibold text-gray-700">Đơn hàng</TableHead>
              <TableHead className="font-semibold text-gray-700">Tổng chi tiêu</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày tham gia</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell>
                  <div className="font-semibold text-gray-900">{customer.name}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-1 h-3 w-3 text-gray-400" />
                      <span className="text-gray-700">{customer.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-1 h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{customer.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                    <span className="truncate max-w-[200px]">{customer.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{customer.totalOrders}</div>
                    {customer.lastOrderDate && (
                      <div className="text-xs text-gray-500">
                        Lần cuối: {formatDate(customer.lastOrderDate)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatPrice(customer.totalSpent)}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === "active" ? "default" : "secondary"} className={
                    customer.status === "active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }>
                    {customer.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{formatDate(customer.joinDate)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                        className="border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết khách hàng</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Thông tin chi tiết về khách hàng {customer.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Thông tin cá nhân</h4>
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Tên:</span>
                                <span className="ml-2 text-gray-600">{customer.name}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Email:</span>
                                <span className="ml-2 text-gray-600">{customer.email}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Số điện thoại:</span>
                                <span className="ml-2 text-gray-600">{customer.phone}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Địa chỉ:</span>
                                <span className="ml-2 text-gray-600">{customer.address}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Thống kê mua hàng</h4>
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Tổng đơn hàng:</span>
                                <span className="ml-2 text-gray-600">{customer.totalOrders}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Tổng chi tiêu:</span>
                                <span className="ml-2 text-gray-600">{formatPrice(customer.totalSpent)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Ngày tham gia:</span>
                                <span className="ml-2 text-gray-600">{formatDate(customer.joinDate)}</span>
                              </div>
                              {customer.lastOrderDate && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Đơn hàng cuối:</span>
                                  <span className="ml-2 text-gray-600">{formatDate(customer.lastOrderDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Ghi chú</h4>
                          <Textarea
                            placeholder="Thêm ghi chú về khách hàng..."
                            className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                          Chỉnh sửa
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Lưu thay đổi
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
