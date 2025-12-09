import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingCart } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'

interface Order {
  orderId: number
  orderCode: string
  orderDate: string
  customerName: string
  customerPhone: string
  totalPrice: number
  finalTotalPrice: number
  paymentMethod: string
  status: string
}

interface RevenueDetailModalProps {
  open: boolean
  onClose: () => void
  startDate: string
  endDate: string
  title: string
}

export default function RevenueDetailModal({
  open,
  onClose,
  startDate,
  endDate,
  title
}: RevenueDetailModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && startDate && endDate) {
      fetchOrders()
    }
  }, [open, startDate, endDate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getOrdersByDateRange(startDate, endDate)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      SHIPPING: { label: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    }
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.finalTotalPrice, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Từ {new Date(startDate).toLocaleDateString('vi-VN')} đến {new Date(endDate).toLocaleDateString('vi-VN')}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có đơn hàng nào trong khoảng thời gian này
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã đơn</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ngày đặt</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Khách hàng</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">SĐT</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tổng tiền</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Thành tiền</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            {order.orderCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                 
                            {formatDate(order.orderDate)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {order.customerPhone}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {order.totalPrice.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-green-600">
                            {order.finalTotalPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
