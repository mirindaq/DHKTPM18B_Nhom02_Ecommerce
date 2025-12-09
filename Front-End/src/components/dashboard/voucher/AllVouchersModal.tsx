import { useEffect, useState } from 'react'
import { Ticket, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { voucherService } from '@/services/voucher.service'
import type { TopVoucherResponse, VoucherDetailResponse } from '@/types/voucher-promotion.type'

interface AllVouchersModalProps {
  open: boolean
  onClose: () => void
  timeType: 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
  year?: number
  month?: number
}

export default function AllVouchersModal({
  open,
  onClose,
  timeType,
  startDate,
  endDate,
  year,
  month
}: AllVouchersModalProps) {
  const [loading, setLoading] = useState(false)
  const [vouchers, setVouchers] = useState<TopVoucherResponse[]>([])
  const [expandedVoucherIds, setExpandedVoucherIds] = useState<Set<number>>(new Set())
  const [voucherDetails, setVoucherDetails] = useState<Record<number, VoucherDetailResponse>>({})

  useEffect(() => {
    if (open) {
      fetchAllVouchers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, timeType, startDate, endDate, year, month])

  const fetchAllVouchers = async () => {
    try {
      setLoading(true)
      let response
      
      if (timeType === 'day') {
        response = await voucherService.getAllVouchersByDay(startDate, endDate)
      } else if (timeType === 'month') {
        response = await voucherService.getAllVouchersByMonth(year, month)
      } else {
        response = await voucherService.getAllVouchersByYear(year)
      }
      
      setVouchers(response.data)
    } catch (error) {
      console.error('Error fetching all vouchers:', error)
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

  const handleToggleDetail = async (voucherId: number) => {
    const newExpandedIds = new Set(expandedVoucherIds)
    
    if (newExpandedIds.has(voucherId)) {
      // Collapse if already expanded
      newExpandedIds.delete(voucherId)
      setExpandedVoucherIds(newExpandedIds)
    } else {
      // Expand and fetch details if not already loaded
      newExpandedIds.add(voucherId)
      setExpandedVoucherIds(newExpandedIds)
      
      if (!voucherDetails[voucherId]) {
        try {
          // Calculate date range based on timeType
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
          
          const response = await voucherService.getVoucherDetail(voucherId, detailStartDate, detailEndDate)
          setVoucherDetails(prev => ({
            ...prev,
            [voucherId]: response.data
          }))
        } catch (error) {
          console.error('Error fetching voucher detail:', error)
          // Set empty data to show error state
          setVoucherDetails(prev => ({
            ...prev,
            [voucherId]: {
              voucherId,
              voucherCode: '',
              voucherName: '',
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="text-xl font-bold">Tất cả Voucher</div>
            <div className="text-sm font-normal text-gray-500 mt-1">
              {getPeriodLabel()}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Không có voucher nào được sử dụng trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Tổng số voucher</div>
                  <div className="text-2xl font-bold text-blue-600">{vouchers.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng lượt sử dụng</div>
                  <div className="text-2xl font-bold text-green-600">
                    {vouchers.reduce((sum, v) => sum + v.usageCount, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng giảm giá</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {vouchers.reduce((sum, v) => sum + v.totalDiscountAmount, 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            </div>

            {/* Vouchers Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã Voucher
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Voucher
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt sử dụng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng giảm giá
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {vouchers.map((voucher, index) => (
                    <>
                      <tr key={voucher.voucherId} className="hover:bg-gray-50 transition-colors border-b">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* <Ticket className="h-4 w-4 text-purple-500" /> */}
                            <span className="font-mono font-semibold text-blue-600">
                              {voucher.voucherCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {voucher.voucherName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* <TrendingUp className="h-4 w-4 text-green-500" /> */}
                            <span className="font-semibold ">
                              {voucher.usageCount.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* <DollarSign className="h-4 w-4 text-orange-500" /> */}
                            <span className="font-semibold ">
                              {voucher.totalDiscountAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDetail(voucher.voucherId)}
                            className="text-xs gap-1"
                          >
                            {expandedVoucherIds.has(voucher.voucherId) ? (
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
                      {expandedVoucherIds.has(voucher.voucherId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            {voucherDetails[voucher.voucherId] ? (
                              <div className="space-y-3">
                                <div className="text-sm font-semibold text-gray-700 mb-3">
                                  Danh sách đơn hàng ({voucherDetails[voucher.voucherId].orders?.length || 0})
                                </div>
                                {!voucherDetails[voucher.voucherId].orders || voucherDetails[voucher.voucherId].orders.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    Không có đơn hàng nào sử dụng voucher này trong khoảng thời gian đã chọn
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {voucherDetails[voucher.voucherId].orders.map((order) => (
                                      <div
                                        key={order.orderId}
                                        className="bg-white border rounded p-3 text-sm"
                                      >
                                        <div className="grid grid-cols-6 gap-3">
                                          <div className="flex items-center gap-2">
                                            {/* <Package className="h-4 w-4 text-blue-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Mã đơn</div>
                                              <div className="font-semibold">{order.orderCode}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* <Calendar className="h-4 w-4 text-gray-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Ngày đặt</div>
                                              <div className="font-medium">{formatDate(order.orderDate)}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* <User className="h-4 w-4 text-purple-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Khách hàng</div>
                                              <div className="font-medium">{order.customerName}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* <DollarSign className="h-4 w-4 text-blue-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Tổng đơn hàng</div>
                                              <div className="font-semibold ">
                                                {order.orderTotal.toLocaleString('vi-VN')}đ
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* <DollarSign className="h-4 w-4 text-orange-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Giảm giá</div>
                                              <div className="font-semibold ">
                                                -{order.discountAmount.toLocaleString('vi-VN')}đ
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* <DollarSign className="h-4 w-4 text-green-500" /> */}
                                            <div>
                                              <div className="text-xs text-gray-500">Sau giảm</div>
                                              <div className="font-semibold ">
                                                {(order.orderTotal - order.discountAmount).toLocaleString('vi-VN')}đ
                                              </div>
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
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
