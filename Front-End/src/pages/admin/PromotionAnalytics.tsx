import { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'
import PromotionStatsCards from '@/components/dashboard/promotion/PromotionStatsCards'
import TopPromotionsTable from '@/components/dashboard/promotion/TopPromotionsTable'
import PromotionFilterSection from '@/components/dashboard/promotion/PromotionFilterSection'
import PromotionComparisonModal from '@/components/dashboard/promotion/PromotionComparisonModal'
import { promotionService } from '@/services/promotion.service'
import type { TopPromotionResponse } from '@/types/voucher-promotion.type'

export default function PromotionAnalytics() {
  const [topPromotions, setTopPromotions] = useState<TopPromotionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)

  // Mock stats - sẽ thay bằng API thực
  const stats = {
    totalUsage: 890,
    totalDiscount: 89000000,
    usageGrowth: 18.2,
    discountGrowth: 14.7
  }

  const fetchData = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      const response = await promotionService.getTopPromotionsByDay(startDate, endDate)
      setTopPromotions(response.data)
    } catch (error) {
      console.error('Error fetching promotion data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Lấy top promotions 30 ngày qua mặc định
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = now.toISOString().split('T')[0]
    
    fetchData(startDate, endDate)
  }, [])

  const handleFilterChange = (startDate: string, endDate: string) => {
    fetchData(startDate, endDate)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-50 rounded-lg">
          <Tag className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê Promotion</h1>
          <p className="text-gray-600">Phân tích hiệu quả chương trình khuyến mãi</p>
        </div>
      </div>

      {/* Filter Section */}
      <PromotionFilterSection
        onFilterChange={handleFilterChange}
        onCompareClick={() => setShowComparison(true)}
      />

      {/* Stats Cards */}
      <PromotionStatsCards
        totalUsage={stats.totalUsage}
        totalDiscount={stats.totalDiscount}
        usageGrowth={stats.usageGrowth}
        discountGrowth={stats.discountGrowth}
      />

      {/* Top Promotions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <TopPromotionsTable promotions={topPromotions} />
      )}

      {/* Comparison Modal */}
      <PromotionComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  )
}
