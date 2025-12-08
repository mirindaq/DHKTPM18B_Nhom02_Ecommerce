import { Card, CardContent } from '@/components/ui/card'
import { Tag, TrendingDown, TrendingUp } from 'lucide-react'

interface PromotionStatsCardsProps {
  totalUsage: number
  totalDiscount: number
  usageGrowth: number
  discountGrowth: number
}

export default function PromotionStatsCards({
  totalUsage,
  totalDiscount,
  usageGrowth,
  discountGrowth
}: PromotionStatsCardsProps) {
  const stats = [
    {
      title: 'Tổng Promotion đã áp dụng',
      value: totalUsage.toLocaleString('vi-VN'),
      growth: usageGrowth,
      icon: Tag,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500'
    },
    {
      title: 'Tổng giảm giá từ Promotion',
      value: `${totalDiscount.toLocaleString('vi-VN')} ₫`,
      growth: discountGrowth,
      icon: TrendingDown,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-l-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`border-l-4 ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center gap-1">
                {stat.growth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.growth >= 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">So với kỳ trước</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
