import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopVoucherResponse } from '@/types/voucher-promotion.type'

// Badge component inline
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
)

interface TopVouchersChartProps {
  vouchers: TopVoucherResponse[]
  onViewDetail: (voucherId: number) => void
  onViewAll?: () => void
}

export default function TopVouchersChart({ vouchers, onViewDetail, onViewAll }: TopVouchersChartProps) {

  const chartData = vouchers.map(v => ({
    name: v.voucherCode,
    'Số lần dùng': v.usageCount,
    'Tổng giảm giá': v.totalDiscountAmount / 1000,
    voucherId: v.voucherId
  }))

  const formatCurrency = (value: number) => {
    return `${(value * 1000).toLocaleString('vi-VN')}đ`
  }

  const getPerformanceBadge = (index: number) => {
    return <Badge className="bg-gray-200 text-gray-700">Top {index + 1}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Top 5 Voucher được dùng nhiều nhất</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Tổng giảm giá') {
                  return formatCurrency(value)
                }
                return value
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="Số lần dùng" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="Tổng giảm giá" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>

        {/* Voucher List with Detail Button */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Xếp hạng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã Voucher</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tên Voucher</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lần dùng</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tổng giảm giá</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher, index) => (
                  <tr 
                    key={voucher.voucherId} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {getPerformanceBadge(index)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {voucher.voucherCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{voucher.voucherName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {voucher.usageCount.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {voucher.totalDiscountAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetail(voucher.voucherId)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
