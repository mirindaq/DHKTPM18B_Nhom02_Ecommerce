import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopPromotionResponse } from '@/types/voucher-promotion.type'

// Badge component inline
const Badge = ({ className, children, variant }: { className?: string; children: React.ReactNode; variant?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
)

interface TopPromotionsTableProps {
  promotions: TopPromotionResponse[]
}

export default function TopPromotionsTable({ promotions }: TopPromotionsTableProps) {
  const getPerformanceBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 Top 1</Badge>
    if (index === 1) return <Badge className="bg-gray-400">🥈 Top 2</Badge>
    if (index === 2) return <Badge className="bg-orange-600">🥉 Top 3</Badge>
    return <Badge variant="outline">Top {index + 1}</Badge>
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
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Top 5 Promotions hiệu quả nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Xếp hạng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tên Promotion</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Loại</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lần dùng</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tổng giảm giá</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                promotions.map((promotion, index) => (
                  <tr 
                    key={promotion.promotionId} 
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      {getPerformanceBadge(index)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {promotion.promotionName}
                      </span>
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
