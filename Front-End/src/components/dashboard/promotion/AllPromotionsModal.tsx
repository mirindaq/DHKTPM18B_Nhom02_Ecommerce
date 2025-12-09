import { useEffect, useState } from 'react'
import { Tag, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { promotionService } from '@/services/promotion.service'
import type { TopPromotionResponse, PromotionDetailResponse } from '@/types/voucher-promotion.type'

interface AllPromotionsModalProps {
  open: boolean
  onClose: () => void
  timeType: 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
  year?: number
  month?: number
}

export default function AllPromotionsModal({
  open,
  onClose,
  timeType,
  startDate,
  endDate,
  year,
  month
}: AllPromotionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [promotions, setPromotions] = useState<TopPromotionResponse[]>([])
  const [expandedPromotionIds, setExpandedPromotionIds] = useState<Set<number>>(new Set())
  const [promotionDetails, setPromotionDetails] = useState<Record<number, PromotionDetailResponse>>({})

  useEffect(() => {
    if (open) {
      fetchAllPromotions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, timeType, startDate, endDate, year, month])

  const fetchAllPromotions = async () => {
    try {
      setLoading(true)
      let response
      
      if (timeType === 'day') {
        response = await promotionService.getAllPromotionsByDay(startDate, endDate)
      } else if (timeType === 'month') {
        response = await promotionService.getAllPromotionsByMonth(year, month)
      } else {
        response = await promotionService.getAllPromotionsByYear(year)
      }
      
      setPromotions(response.data)
    } catch (error) {
      console.error('Error fetching all promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = () => {
    if (timeType === 'day' && startDate && endDate) {
      return `Theo ngày: ${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
    } else if (timeType === 'month' && year && month) {
      return `Theo tháng: Tháng ${month}/${year}`
    } else if (timeType === 'year' && year) {
      return `Theo năm: ${year}`
    }
    return ''
  }

  const handleToggleDetail = async (promotionId: number) => {
    const newExpandedIds = new Set(expandedPromotionIds)
    
    if (newExpandedIds.has(promotionId)) {
      newExpandedIds.delete(promotionId)
      setExpandedPromotionIds(newExpandedIds)
    } else {
      newExpandedIds.add(promotionId)
      setExpandedPromotionIds(newExpandedIds)
      
      if (!promotionDetails[promotionId]) {
        try {
          let detailStartDate = startDate
          let detailEndDate = endDate
          
          if (timeType === 'month' && year && month) {
            const firstDay = new Date(year, month - 1, 1)
            const lastDay = new Date(year, month, 0)
            detailStartDate = firstDay.toISOString().split('T')[0]
            detailEndDate = lastDay.toISOString().split('T')[0]
          } else if (timeType === 'year' && year) {
            detailStartDate = `${year}-01-01`
            detailEndDate = `${year}-12-31`
          }
          
          const response = await promotionService.getPromotionDetail(promotionId, detailStartDate, detailEndDate)
          setPromotionDetails(prev => ({
            ...prev,
            [promotionId]: response.data
          }))
        } catch (error) {
          console.error('Error fetching promotion detail:', error)
          setPromotionDetails(prev => ({
            ...prev,
            [promotionId]: {
              promotionId,
              promotionName: '',
              promotionType: '',
              totalUsage: 0,
              totalDiscountAmount: 0,
              orders: []
            }
          }))
        }
      }
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
      <DialogContent className="!max-w-[95vw] w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="text-xl font-bold">Tất cả Promotion</div>
            <div className="text-sm font-normal text-gray-500 mt-1">
              {getPeriodLabel()}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Không có promotion nào được sử dụng trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Tổng số promotion</div>
                  <div className="text-2xl font-bold text-purple-600">{promotions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng lượt sử dụng</div>
                  <div className="text-2xl font-bold text-green-600">
                    {promotions.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng giảm giá</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {promotions.reduce((sum, p) => sum + p.totalDiscountAmount, 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            </div>

            {/* Promotions Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Promotion</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt sử dụng</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng giảm giá</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {promotions.map((promotion, index) => (
                    <>
                      <tr key={promotion.promotionId} className="hover:bg-gray-50 transition-colors border-b">
                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{promotion.promotionName}</td>
                        <td className="px-4 py-3">{getPromotionTypeBadge(promotion.promotionType)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold">{promotion.usageCount.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">{promotion.totalDiscountAmount.toLocaleString('vi-VN')}đ</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDetail(promotion.promotionId)}
                            className="text-xs gap-1"
                          >
                            {expandedPromotionIds.has(promotion.promotionId) ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Chi tiết
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {expandedPromotionIds.has(promotion.promotionId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            {promotionDetails[promotion.promotionId] ? (
                              <div className="space-y-3">
                                <div className="text-sm font-semibold text-gray-700 mb-3">
                                  Danh sách đơn hàng ({promotionDetails[promotion.promotionId].orders?.length || 0})
                                </div>
                                {!promotionDetails[promotion.promotionId].orders || promotionDetails[promotion.promotionId].orders.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    Không có đơn hàng nào sử dụng promotion này trong khoảng thời gian đã chọn
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {promotionDetails[promotion.promotionId].orders.map((order) => (
                                      <div key={order.orderId} className="bg-white border rounded p-3 text-sm">
                                        <div className="grid grid-cols-6 gap-3">
                                          <div>
                                            <div className="text-xs text-gray-500">Mã đơn</div>
                                            <a 
                                              href={`/orders/${order.orderId}`}
                                              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {order.orderCode}
                                            </a>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Ngày đặt</div>
                                            <div className="font-medium text-gray-900">{formatDate(order.orderDate)}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Khách hàng</div>
                                            <div className="font-medium text-gray-900">{order.customerName}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Tổng đơn hàng</div>
                                            <div className="font-semibold text-gray-900">
                                              {order.orderTotal.toLocaleString('vi-VN')}đ
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Giảm giá</div>
                                            <div className="font-semibold text-red-600">
                                              -{order.discountAmount.toLocaleString('vi-VN')}đ
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Sau giảm</div>
                                            <div className="font-semibold text-gray-900">
                                              {(order.orderTotal - order.discountAmount).toLocaleString('vi-VN')}đ
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
