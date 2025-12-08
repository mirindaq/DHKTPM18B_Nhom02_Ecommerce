import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopPromotionResponse } from '@/types/voucher-promotion.type'

// Badge component inline
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
)

interface TopPromotionsChartProps {
  promotions: TopPromotionResponse[]
  onViewDetail: (promotionId: number) => void
  onViewAll?: () => void
}

export default function TopPromotionsChart({ promotions, onViewDetail, onViewAll }: TopPromotionsChartProps) {

  const chartData = promotions.map(p => ({
    name: p.promotionName.length > 15 ? p.promotionName.substring(0, 15) + '...' : p.promotionName,
    'Số lần dùng': p.usageCount,
    'Tổng giảm giá': p.totalDiscountAmount / 1000,
    promotionId: p.promotionId
  }))

  const formatCurrency = (value: number) => {
    return `${(value * 1000).toLocaleString('vi-VN')}đ`
  }

  const getPerformanceBadge = (index: number) => {
    return <Badge className="bg-gray-200 text-gray-700">Top {index + 1}</Badge>
  }

  const getPromotionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      PRODUCT: { label: 'Sản phẩm', className: 'bg-blue-100 text-blue-800' },
      ORDER: { label: 'Đơn hàng', className: 'bg-green-100 text-green-800' },
      CATEGORY: { label: 'Danh mục', className: 'bg-purple-100 text-purple-800' }
    }
    const typeInfo = types[type] || { label: type, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={typeInfo.className}>{typeInfo.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Top 5 Promotion được dùng nhiều nhất</CardTitle>
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

        {/* Promotion List with Detail Button */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Xếp hạng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tên Promotion</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Loại</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lần dùng</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tổng giảm giá</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                promotions.map((promotion, index) => (
                  <tr 
                    key={promotion.promotionId} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {getPerformanceBadge(index)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{promotion.promotionName}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getPromotionTypeBadge(promotion.promotionType)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {promotion.usageCount.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {promotion.totalDiscountAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetail(promotion.promotionId)}
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
