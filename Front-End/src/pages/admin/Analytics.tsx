import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'
import type { RevenueByMonthResponse, RevenueByDayResponse, RevenueByYearResponse, TopProductResponse } from '@/types/dashboard.type'
import FilterSection, { type FilterValues } from '@/components/dashboard/FilterSection'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueCard from '@/components/dashboard/RevenueCard'
import TopProductsCard from '@/components/dashboard/TopProductsCard'
import CompareSection, { type CompareParams } from '@/components/dashboard/CompareSection'
import AllProductsModal from '@/components/dashboard/product/AllProductsModal'
import ProductDetailModal from '@/components/dashboard/product/ProductDetailModal'
import RevenueDetailModal from '@/components/dashboard/revenue/RevenueDetailModal'
import { BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [showRevenueDetail, setShowRevenueDetail] = useState(false)
  const [revenueDetailParams, setRevenueDetailParams] = useState({
    startDate: '',
    endDate: '',
    title: ''
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
        // Set date range for detail modal
        setDateRange({ 
          startDate: values.startDate || '', 
          endDate: values.endDate || '' 
        })
      } else if (values.timeType === 'month') {
        // Nếu month = undefined (chọn "Tất cả"), gọi API year
        const [revenueResponse, productsResponse] = await Promise.all([
          dashboardService.getRevenueByMonth(values.year, values.month),
          values.month === undefined 
            ? dashboardService.getTopProductsByYear(values.year)
            : dashboardService.getTopProductsByMonth(values.year, values.month)
        ])
        setRevenueData(revenueResponse.data)
        setTopProducts(productsResponse.data)
        // Set date range for detail modal
        if (values.month) {
          const year = values.year || new Date().getFullYear()
          const startDate = new Date(year, values.month - 1, 1).toISOString().split('T')[0]
          const endDate = new Date(year, values.month, 0).toISOString().split('T')[0]
          setDateRange({ startDate, endDate })
        }
      } else {
        const [revenueResponse, productsResponse] = await Promise.all([
          dashboardService.getRevenueByYear(values.year),
          dashboardService.getTopProductsByYear(values.year)
        ])
        setRevenueData(revenueResponse.data)
        setTopProducts(productsResponse.data)
        // Set date range for detail modal
        const year = values.year || new Date().getFullYear()
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`
        setDateRange({ startDate, endDate })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProductDetail = (productId: number) => {
    setSelectedProductId(productId)
    setShowProductDetail(true)
  }

  const handleViewAllProducts = () => {
    setShowAllProducts(true)
  }

  const handleViewRevenueDetail = (startDate: string, endDate: string, title: string) => {
    setRevenueDetailParams({ startDate, endDate, title })
    setShowRevenueDetail(true)
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thống kê Doanh thu</h1>
              <p className="text-sm text-gray-600">Theo dõi hiệu suất kinh doanh và xu hướng thị trường</p>
            </div>
          </div>
          <Button
            onClick={async () => {
              try {
                setLoading(true)
                let startDate: string
                let endDate: string

                // Determine parameters based on current filter
                if (currentFilter.timeType === 'day' && currentFilter.startDate && currentFilter.endDate) {
                  startDate = currentFilter.startDate
                  endDate = currentFilter.endDate
                } else {
                  // For month/year, convert to date range
                  const year = currentFilter.year || new Date().getFullYear()
                  const month = currentFilter.month || 1
                  
                  if (currentFilter.timeType === 'month') {
                    startDate = `${year}-${String(month).padStart(2, '0')}-01`
                    const lastDay = new Date(year, month, 0).getDate()
                    endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
                  } else {
                    // year
                    startDate = `${year}-01-01`
                    endDate = `${year}-12-31`
                  }
                }

                const blob = await dashboardService.exportExcel(startDate, endDate)
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `dashboard_${startDate}_${endDate}.xlsx`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
              } catch (error) {
                console.error('Error exporting Excel:', error)
                alert('Có lỗi xảy ra khi export Excel')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <FilterSection 
        onFilter={handleFilter}
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
          onViewDetail={handleViewRevenueDetail}
        />
        
        {/* Top Products Card - 1 column */}
        <TopProductsCard 
          data={topProducts}
          loading={loading}
          onViewDetail={handleViewProductDetail}
          onViewAll={handleViewAllProducts}
        />
      </div>

      {/* All Products Modal */}
      <AllProductsModal
        open={showAllProducts}
        onClose={() => setShowAllProducts(false)}
        timeType={currentFilter.timeType}
        startDate={currentFilter.startDate}
        endDate={currentFilter.endDate}
        year={currentFilter.year}
        month={currentFilter.month}
        onViewDetail={handleViewProductDetail}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        productId={selectedProductId}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      {/* Revenue Detail Modal */}
      <RevenueDetailModal
        open={showRevenueDetail}
        onClose={() => setShowRevenueDetail(false)}
        startDate={revenueDetailParams.startDate}
        endDate={revenueDetailParams.endDate}
        title={revenueDetailParams.title}
      />
    </div>
  )
}
