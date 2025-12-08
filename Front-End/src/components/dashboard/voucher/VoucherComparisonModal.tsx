import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, TrendingUp, TrendingDown, X } from 'lucide-react'
import { voucherService } from '@/services/voucher.service'
import type { VoucherComparisonResponse } from '@/types/voucher-promotion.type'

interface VoucherComparisonModalProps {
  open: boolean
  onClose: () => void
}

export default function VoucherComparisonModal({ open, onClose }: VoucherComparisonModalProps) {
  const [startDate1, setStartDate1] = useState('')
  const [endDate1, setEndDate1] = useState('')
  const [startDate2, setStartDate2] = useState('')
  const [endDate2, setEndDate2] = useState('')
  const [comparison, setComparison] = useState<VoucherComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
      alert('Vui lòng chọn đầy đủ ngày tháng')
      return
    }

    try {
      setLoading(true)
      const response = await voucherService.compareVoucher(
        'day',
        startDate1,
        endDate1,
        startDate2,
        endDate2
      )
      setComparison(response.data)
    } catch (error) {
      console.error('Error comparing vouchers:', error)
      alert('Có lỗi xảy ra khi so sánh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>So sánh Voucher giữa 2 kỳ</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period 1 */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-700 mb-3">Kỳ 1</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate1}
                      onChange={(e) => setStartDate1(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate1}
                      onChange={(e) => setEndDate1(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period 2 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-700 mb-3">Kỳ 2</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate2}
                      onChange={(e) => setStartDate2(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate2}
                      onChange={(e) => setEndDate2(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compare Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading ? 'Đang so sánh...' : 'So sánh'}
            </Button>
          </div>

          {/* Comparison Results */}
          {comparison && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kết quả so sánh</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usage Comparison */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Số lần sử dụng</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Kỳ 1:</span>
                        <span className="font-semibold">{comparison.usageCount1.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">Kỳ 2:</span>
                        <span className="font-semibold">{comparison.usageCount2.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-sm font-medium">Chênh lệch:</span>
                        <div className="flex items-center gap-1">
                          {comparison.usageGrowthPercent >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-bold ${comparison.usageGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {comparison.usageGrowthPercent >= 0 ? '+' : ''}{comparison.usageGrowthPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Discount Comparison */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Tổng giảm giá</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Kỳ 1:</span>
                        <span className="font-semibold">{comparison.totalDiscount1.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">Kỳ 2:</span>
                        <span className="font-semibold">{comparison.totalDiscount2.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-sm font-medium">Chênh lệch:</span>
                        <div className="flex items-center gap-1">
                          {comparison.discountGrowthPercent >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-bold ${comparison.discountGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {comparison.discountGrowthPercent >= 0 ? '+' : ''}{comparison.discountGrowthPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
