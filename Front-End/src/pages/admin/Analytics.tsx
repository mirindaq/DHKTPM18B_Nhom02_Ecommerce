import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'
import type { RevenueByMonthResponse, RevenueByDayResponse, RevenueByYearResponse, TopProductResponse } from '@/types/dashboard.type'
import FilterSection, { type FilterValues } from '@/components/dashboard/FilterSection'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueCard from '@/components/dashboard/RevenueCard'
import TopProductsCard from '@/components/dashboard/TopProductsCard'
import CompareSection, { type CompareParams } from '@/components/dashboard/CompareSection'
import { BarChart3 } from 'lucide-react'

export default function Analytics() {
  const [revenueData, setRevenueData] = useState<RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[]>([])
  const [topProducts, setTopProducts] = useState<TopProductResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareData1, setCompareData1] = useState<RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[]>()
  const [compareData2, setCompareData2] = useState<RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[]>()
  const [currentFilter, setCurrentFilter] = useState<FilterValues>({
    timeType: 'month',
    year: new Date().getFullYear()
  })

  const handleFilter = async (values: FilterValues) => {
    try {
      setLoading(true)
      setCurrentFilter(values)

      // Fetch both revenue and top products data
      if (values.timeType === 'day') {
        const [revenueResponse, productsResponse] = await Promise.all([
          dashboardService.getRevenueByDay(values.startDate, values.endDate),
          dashboardService.getTopProductsByDay(values.startDate, values.endDate)
        ])
        setRevenueData(revenueResponse.data)
        setTopProducts(productsResponse.data)
      } else if (values.timeType === 'month') {
        const [revenueResponse, productsResponse] = await Promise.all([
          dashboardService.getRevenueByMonth(values.year, values.month),
          dashboardService.getTopProductsByMonth(values.year, values.month)
        ])
        setRevenueData(revenueResponse.data)
        setTopProducts(productsResponse.data)
      } else {
        const [revenueResponse, productsResponse] = await Promise.all([
          dashboardService.getRevenueByYear(values.year),
          dashboardService.getTopProductsByYear(values.year)
        ])
        setRevenueData(revenueResponse.data)
        setTopProducts(productsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async (period1: CompareParams, period2: CompareParams) => {
    try {
      setLoading(true)

      // Fetch data for period 1
      let data1: RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[] = []
      if (period1.timeType === 'day') {
        const response = await dashboardService.getRevenueByDay(period1.startDate, period1.endDate)
        data1 = response.data
      } else if (period1.timeType === 'month') {
        const response = await dashboardService.getRevenueByMonth(period1.year)
        data1 = response.data.filter(item => item.month === period1.month)
      } else {
        const response = await dashboardService.getRevenueByYear(period1.year)
        data1 = response.data
      }

      // Fetch data for period 2
      let data2: RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[] = []
      if (period2.timeType === 'day') {
        const response = await dashboardService.getRevenueByDay(period2.startDate, period2.endDate)
        data2 = response.data
      } else if (period2.timeType === 'month') {
        const response = await dashboardService.getRevenueByMonth(period2.year)
        data2 = response.data.filter(item => item.month === period2.month)
      } else {
        const response = await dashboardService.getRevenueByYear(period2.year)
        data2 = response.data
      }

      setCompareData1(data1)
      setCompareData2(data2)
    } catch (error) {
      console.error('Error comparing data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orderCount, 0)
  const totalCustomers = 150 // Mock data
  const growthRate = 3.2 // Mock data

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê & Phân tích</h1>
            <p className="text-sm text-gray-600">Theo dõi hiệu suất kinh doanh và xu hướng thị trường</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <FilterSection 
        onFilter={handleFilter} 
        onCompareToggle={setCompareMode}
        compareMode={compareMode}
      />

      {/* Compare Section */}
      {compareMode && (
        <CompareSection
          onCompare={handleCompare}
          onClose={() => setCompareMode(false)}
          data1={compareData1}
          data2={compareData2}
          loading={loading}
        />
      )}

      {/* Stats Cards */}
      {revenueData.length > 0 && (
        <StatsCards
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          totalCustomers={totalCustomers}
          growthRate={growthRate}
        />
      )}

      {/* Main Content - 2 cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card - 2 columns */}
        <RevenueCard 
          data={revenueData} 
          timeType={currentFilter.timeType}
          loading={loading}
        />
        
        {/* Top Products Card - 1 column */}
        <TopProductsCard 
          data={topProducts}
          loading={loading}
        />
      </div>
    </div>
  )
}
