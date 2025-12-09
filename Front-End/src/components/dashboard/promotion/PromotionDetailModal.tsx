import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { promotionService } from '@/services/promotion.service'
import type { PromotionDetailResponse } from '@/types/voucher-promotion.type'

interface PromotionDetailModalProps {
  open: boolean
  onClose: () => void
  promotionId: number | null
  startDate?: string
  endDate?: string
}

export default function PromotionDetailModal({
  open,
  onClose,
  promotionId,
  startDate,
  endDate
}: PromotionDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<PromotionDetailResponse | null>(null)

  useEffect(() => {
    if (open && promotionId) {
      fetchDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, promotionId])

  const fetchDetail = async () => {
    if (!promotionId) return
    
    try {
      setLoading(true)
      const response = await promotionService.getPromotionDetail(promotionId, startDate, endDate)
      setDetail(response.data)
    } catch (error) {
      console.error('Error fetching promotion detail:', error)
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

  const getPromotionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      PRODUCT: { label: 'Sản phẩm', className: 'bg-blue-100 text-blue-800' },
      ALL: { label: 'Tất cả', className: 'bg-green-100 text-green-800' },
      CATEGORY: { label: 'Danh mục', className: 'bg-purple-100 text-purple-800' },
      BRAND: { label: 'Thương hiệu', className: 'bg-orange-100 text-orange-800' },
      PRODUCT_VARIANT: { label: 'Biến thể', className: 'bg-pink-100 text-pink-800' }
    }
    const typeInfo = types[type] || { label: type, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.className}`}>
        {typeInfo.label}
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết sử dụng Promotion</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Promotion Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tên Promotion</div>
                  <div className="text-2xl font-bold text-purple-600">{detail.promotionName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Loại</div>
                  <div className="mt-1">{getPromotionTypeBadge(detail.promotionType)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tổng số lần sử dụng</div>
                  <div className="text-xl font-bold text-green-600">{detail.totalUsage.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tổng giảm giá</div>
                  <div className="text-xl font-bold text-orange-600">
                    {detail.totalDiscountAmount.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Danh sách đơn hàng ({detail.orders.length})
              </h3>
              <div className="space-y-3">
                {detail.orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào sử dụng promotion này trong khoảng thời gian đã chọn
                  </div>
                ) : (
                  detail.orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Mã đơn hàng</div>
                          <a 
                            href={`/orders/${order.orderId}`}
                            className="font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {order.orderCode}
                          </a>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Ngày đặt</div>
                          <div className="font-medium">{formatDate(order.orderDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Khách hàng</div>
                          <div className="font-medium">{order.customerName}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Giảm giá</div>
                          <div className="font-bold text-green-600">
                            {order.discountAmount.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Tổng đơn hàng: <span className="font-semibold text-gray-900">
                            {order.orderTotal.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Sau giảm: <span className="font-semibold text-purple-600">
                            {(order.orderTotal - order.discountAmount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
