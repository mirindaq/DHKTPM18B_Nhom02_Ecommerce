import { useState, useEffect } from 'react'
import { Ticket } from 'lucide-react'
import VoucherStatsCards from '@/components/dashboard/voucher/VoucherStatsCards'
import TopVouchersTable from '@/components/dashboard/voucher/TopVouchersTable'
import VoucherFilterSection from '@/components/dashboard/voucher/VoucherFilterSection'
import VoucherComparisonModal from '@/components/dashboard/voucher/VoucherComparisonModal'
import { voucherService } from '@/services/voucher.service'
import type { TopVoucherResponse } from '@/types/voucher-promotion.type'

export default function VoucherAnalytics() {
  const [topVouchers, setTopVouchers] = useState<TopVoucherResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  // Mock stats - sẽ thay bằng API thực
  const stats = {
    totalUsage: 1250,
    totalDiscount: 125000000,
    usageGrowth: 15.5,
    discountGrowth: 12.3
  }

  const fetchData = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      const response = await voucherService.getTopVouchersByDay(startDate, endDate)
      setTopVouchers(response.data)
    } catch (error) {
      console.error('Error fetching voucher data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Lấy top vouchers 30 ngày qua mặc định
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = now.toISOString().split('T')[0]
    
    setDateRange({ startDate, endDate })
    fetchData(startDate, endDate)
  }, [])

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate })
    fetchData(startDate, endDate)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Ticket className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê Voucher</h1>
          <p className="text-gray-600">Phân tích hiệu quả sử dụng voucher</p>
        </div>
      </div>

      {/* Filter Section */}
      <VoucherFilterSection
        onFilterChange={handleFilterChange}
        onCompareClick={() => setShowComparison(true)}
      />

      {/* Stats Cards */}
      <VoucherStatsCards
        totalUsage={stats.totalUsage}
        totalDiscount={stats.totalDiscount}
        usageGrowth={stats.usageGrowth}
        discountGrowth={stats.discountGrowth}
      />

      {/* Top Vouchers Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <TopVouchersTable vouchers={topVouchers} />
      )}

      {/* Comparison Modal */}
      <VoucherComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  )
}
