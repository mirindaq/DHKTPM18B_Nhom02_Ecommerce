import { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'
import PromotionStatsCards from '@/components/dashboard/promotion/PromotionStatsCards'
import TopPromotionsChart from '@/components/dashboard/promotion/TopPromotionsChart'
import AllPromotionsModal from '@/components/dashboard/promotion/AllPromotionsModal'
import PromotionDetailModal from '@/components/dashboard/promotion/PromotionDetailModal'
import PromotionComparisonModal from '@/components/dashboard/promotion/PromotionComparisonModal'
import FilterSection, { type FilterValues } from '@/components/dashboard/FilterSection'
import { promotionService } from '@/services/promotion.service'
import type { TopPromotionResponse } from '@/types/voucher-promotion.type'

export default function PromotionAnalytics() {
  const [topPromotions, setTopPromotions] = useState<TopPromotionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showAllPromotions, setShowAllPromotions] = useState(false)
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [currentFilter, setCurrentFilter] = useState<{
    type: 'day' | 'month' | 'year'
    params: { startDate?: string; endDate?: string; year?: number; month?: number }
  }>({
    type: 'day',
    params: {}
  })

  // Mock stats - sẽ thay bằng API thực
  const stats = {
    totalUsage: 890,
    totalDiscount: 89000000,
    usageGrowth: 18.2,
    discountGrowth: 14.7
  }

  const fetchDataByDay = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      const response = await promotionService.getTopPromotionsByDay(startDate, endDate)
      setTopPromotions(response.data)
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching promotion data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataByMonth = async (year: number, month: number) => {
    try {
      setLoading(true)
      const response = await promotionService.getTopPromotionsByMonth(year, month)
      setTopPromotions(response.data)
      // Set date range for detail modal
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching promotion data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataByYear = async (year: number) => {
    try {
      setLoading(true)
      const response = await promotionService.getTopPromotionsByYear(year)
      setTopPromotions(response.data)
      // Set date range for detail modal
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching promotion data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (values: FilterValues) => {
    const params = {
      startDate: values.startDate,
      endDate: values.endDate,
      year: values.year,
      month: values.month
    }
    
    setCurrentFilter({ type: values.timeType, params })

    if (values.timeType === 'day' && values.startDate && values.endDate) {
      fetchDataByDay(values.startDate, values.endDate)
    } else if (values.timeType === 'month' && values.year && values.month) {
      fetchDataByMonth(values.year, values.month)
    } else if (values.timeType === 'year' && values.year) {
      fetchDataByYear(values.year)
    }
  }

  const handleCompareToggle = (enabled: boolean) => {
    setShowComparison(enabled)
  }

  const handleViewDetail = (promotionId: number) => {
    setSelectedPromotionId(promotionId)
    setShowDetail(true)
  }

  const handleViewAllPromotions = () => {
    setShowAllPromotions(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thống kê Promotion</h1>
            <p className="text-gray-600">Phân tích hiệu quả chương trình khuyến mãi</p>
          </div>
        </div>
        <Button
          onClick={() => console.log('Export Excel')}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Filter Section */}
      <FilterSection
        onFilter={handleFilter}
        onCompareToggle={handleCompareToggle}
        compareMode={showComparison}
      />

      {/* Stats Cards */}
      <PromotionStatsCards
        totalUsage={stats.totalUsage}
        totalDiscount={stats.totalDiscount}
        usageGrowth={stats.usageGrowth}
        discountGrowth={stats.discountGrowth}
      />

      {/* Top Promotions Chart */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <TopPromotionsChart
          promotions={topPromotions}
          onViewDetail={handleViewDetail}
          onViewAll={handleViewAllPromotions}
        />
      )}

      {/* All Promotions Modal */}
      <AllPromotionsModal
        open={showAllPromotions}
        onClose={() => setShowAllPromotions(false)}
        timeType={currentFilter.type}
        startDate={currentFilter.params.startDate}
        endDate={currentFilter.params.endDate}
        year={currentFilter.params.year}
        month={currentFilter.params.month}
      />

      {/* Detail Modal */}
      <PromotionDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        promotionId={selectedPromotionId}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      {/* Comparison Modal */}
      <PromotionComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  )
}
