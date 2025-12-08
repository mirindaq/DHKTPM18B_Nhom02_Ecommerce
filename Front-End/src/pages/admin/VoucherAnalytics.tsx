import { useState } from 'react'
import { Ticket, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VoucherStatsCards from '@/components/dashboard/voucher/VoucherStatsCards'
import TopVouchersChart from '@/components/dashboard/voucher/TopVouchersChart'
import VoucherDetailModal from '@/components/dashboard/voucher/VoucherDetailModal'
import VoucherComparisonModal from '@/components/dashboard/voucher/VoucherComparisonModal'
import AllVouchersModal from '@/components/dashboard/voucher/AllVouchersModal'
import FilterSection, { type FilterValues } from '@/components/dashboard/FilterSection'
import { voucherService } from '@/services/voucher.service'
import type { TopVoucherResponse } from '@/types/voucher-promotion.type'

export default function VoucherAnalytics() {
  const [topVouchers, setTopVouchers] = useState<TopVoucherResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showAllVouchers, setShowAllVouchers] = useState(false)
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null)
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
    totalUsage: 1250,
    totalDiscount: 125000000,
    usageGrowth: 15.5,
    discountGrowth: 12.3
  }

  const fetchDataByDay = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      const response = await voucherService.getTopVouchersByDay(startDate, endDate)
      setTopVouchers(response.data)
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching voucher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataByMonth = async (year: number, month: number) => {
    try {
      setLoading(true)
      const response = await voucherService.getTopVouchersByMonth(year, month)
      setTopVouchers(response.data)
      // Set date range for detail modal
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching voucher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataByYear = async (year: number) => {
    try {
      setLoading(true)
      const response = await voucherService.getTopVouchersByYear(year)
      setTopVouchers(response.data)
      // Set date range for detail modal
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error('Error fetching voucher data:', error)
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

  const handleViewDetail = (voucherId: number) => {
    setSelectedVoucherId(voucherId)
    setShowDetail(true)
  }

  const handleViewAllVouchers = () => {
    setShowAllVouchers(true)
  }

  const handleExportExcel = async () => {
    try {
      setLoading(true)
      await voucherService.exportDashboardExcel(dateRange.startDate, dateRange.endDate)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Có lỗi xảy ra khi export Excel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thống kê Voucher</h1>
            <p className="text-gray-600">Phân tích hiệu quả sử dụng voucher</p>
          </div>
        </div>
        <Button
          onClick={handleExportExcel}
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
      <VoucherStatsCards
        totalUsage={stats.totalUsage}
        totalDiscount={stats.totalDiscount}
        usageGrowth={stats.usageGrowth}
        discountGrowth={stats.discountGrowth}
      />

      {/* Top Vouchers Chart */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <TopVouchersChart
          vouchers={topVouchers}
          onViewDetail={handleViewDetail}
          onViewAll={handleViewAllVouchers}
        />
      )}

      {/* All Vouchers Modal */}
      <AllVouchersModal
        open={showAllVouchers}
        onClose={() => setShowAllVouchers(false)}
        timeType={currentFilter.type}
        startDate={currentFilter.params.startDate}
        endDate={currentFilter.params.endDate}
        year={currentFilter.params.year}
        month={currentFilter.params.month}
      />

      {/* Detail Modal */}
      <VoucherDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        voucherId={selectedVoucherId}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      {/* Comparison Modal */}
      <VoucherComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  )
}
