import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Package, Calendar, User, ShoppingCart } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import type { ProductDetailResponse } from '@/types/dashboard.type'

interface ProductDetailModalProps {
  open: boolean
  onClose: () => void
  productId: number | null
  startDate: string
  endDate: string
}

export default function ProductDetailModal({
  open,
  onClose,
  productId,
  startDate,
  endDate
}: ProductDetailModalProps) {
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && productId) {
      fetchProductDetail()
    }
  }, [open, productId, startDate, endDate])

  const fetchProductDetail = async () => {
    if (!productId) return

    try {
      setLoading(true)
      const response = await dashboardService.getProductDetail(productId, startDate, endDate)
      setProductDetail(response.data)
    } catch (error) {
      console.error('Error fetching product detail:', error)
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-purple-600" />
            Chi tiết sản phẩm
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : productDetail ? (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-start gap-4">
                <img
                  src={productDetail.productImage}
                  alt={productDetail.productName}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image'
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {productDetail.productName}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Tổng số lượng bán</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {productDetail.totalQuantitySold.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Tổng doanh thu</p>
                      <p className="text-2xl font-bold text-green-600">
                        {productDetail.totalRevenue.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                Danh sách đơn hàng ({productDetail.orders.length})
              </h4>
              
              {productDetail.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có đơn hàng nào
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã đơn</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ngày đặt</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Khách hàng</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lượng</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Đơn giá</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productDetail.orders.map((order) => (
                        <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm font-semibold text-blue-600">
                              {order.orderCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.orderDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <User className="h-4 w-4 text-gray-400" />
                              {order.customerName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-semibold text-purple-600">
                              {order.quantityOrdered}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm text-gray-600">
                              {order.unitPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-semibold text-green-600">
                              {order.totalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy thông tin sản phẩm
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
