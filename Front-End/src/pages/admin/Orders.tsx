import  { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  orderDate: string
  items: OrderItem[]
}

interface OrderItem {
  productName: string
  quantity: number
  price: number
}

const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    totalAmount: 25000000,
    status: "delivered",
    paymentStatus: "paid",
    orderDate: "2024-01-15",
    items: [
      { productName: "iPhone 15 Pro", quantity: 1, price: 25000000 }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@email.com",
    totalAmount: 41500000,
    status: "shipped",
    paymentStatus: "paid",
    orderDate: "2024-01-16",
    items: [
      { productName: "MacBook Air M2", quantity: 1, price: 35000000 },
      { productName: "AirPods Pro", quantity: 1, price: 6500000 }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customerName: "Lê Văn C",
    customerEmail: "levanc@email.com",
    totalAmount: 6500000,
    status: "processing",
    paymentStatus: "paid",
    orderDate: "2024-01-17",
    items: [
      { productName: "AirPods Pro", quantity: 1, price: 6500000 }
    ]
  },
  {
    id: 4,
    orderNumber: "ORD-004",
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@email.com",
    totalAmount: 25000000,
    status: "pending",
    paymentStatus: "pending",
    orderDate: "2024-01-18",
    items: [
      { productName: "iPhone 15 Pro", quantity: 1, price: 25000000 }
    ]
  }
]

const statusConfig = {
  pending: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Đang xử lý", icon: Package, color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Đã gửi hàng", icon: Truck, color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Đã giao hàng", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", icon: AlertCircle, color: "bg-red-100 text-red-800" }
}

const paymentStatusConfig = {
  pending: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
  failed: { label: "Thanh toán thất bại", color: "bg-red-100 text-red-800" }
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.totalAmount, 0)
  }

  const getTotalOrders = () => orders.length
  const getPendingOrders = () => orders.filter(order => order.status === "pending").length
  const getDeliveredOrders = () => orders.filter(order => order.status === "delivered").length

  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-lg text-gray-600">
          Quản lý và theo dõi tất cả đơn hàng trong hệ thống
        </p>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
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
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="shipped">Đã gửi hàng</SelectItem>
            <SelectItem value="delivered">Đã giao hàng</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Mã đơn hàng</TableHead>
              <TableHead className="font-semibold text-gray-700">Khách hàng</TableHead>
              <TableHead className="font-semibold text-gray-700">Tổng tiền</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Thanh toán</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày đặt</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
              return (
                <TableRow key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-semibold text-gray-900">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[order.status].color} border-0`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${paymentStatusConfig[order.paymentStatus].color} border-0`}>
                      {paymentStatusConfig[order.paymentStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng {order.orderNumber}</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Thông tin chi tiết về đơn hàng và khách hàng
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900">Thông tin khách hàng</h4>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tên:</span> {order.customerName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> {order.customerEmail}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900">Thông tin đơn hàng</h4>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Ngày đặt:</span> {formatDate(order.orderDate)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tổng tiền:</span> {formatPrice(order.totalAmount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Sản phẩm</h4>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-medium text-gray-900">{item.productName}</span>
                                    <span className="text-sm text-gray-600">
                                      {item.quantity} x {formatPrice(item.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Select 
                              value={order.status} 
                              onValueChange={(value: Order["status"]) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Cập nhật trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="processing">Đang xử lý</SelectItem>
                                <SelectItem value="shipped">Đã gửi hàng</SelectItem>
                                <SelectItem value="delivered">Đã giao hàng</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                              </SelectContent>
                            </Select>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
