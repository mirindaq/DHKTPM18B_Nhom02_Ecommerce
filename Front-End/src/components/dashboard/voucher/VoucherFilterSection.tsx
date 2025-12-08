import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Filter, RefreshCw } from 'lucide-react'

interface VoucherFilterSectionProps {
  onFilterChange: (startDate: string, endDate: string) => void
  onCompareClick: () => void
}

export default function VoucherFilterSection({ onFilterChange, onCompareClick }: VoucherFilterSectionProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleQuickFilter = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    setStartDate(startStr)
    setEndDate(endStr)
    onFilterChange(startStr, endStr)
  }

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      onFilterChange(startDate, endDate)
    }
  }

  const handleReset = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    setStartDate(startStr)
    setEndDate(endStr)
    onFilterChange(startStr, endStr)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Date Range Picker */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilter}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Áp dụng
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Nhanh:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(0)}
            className="text-xs"
          >
            Hôm nay
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(7)}
            className="text-xs"
          >
            7 ngày qua
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(30)}
            className="text-xs"
          >
            30 ngày qua
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const now = new Date()
              const start = new Date(now.getFullYear(), now.getMonth(), 1)
              setStartDate(start.toISOString().split('T')[0])
              setEndDate(now.toISOString().split('T')[0])
              onFilterChange(start.toISOString().split('T')[0], now.toISOString().split('T')[0])
            }}
            className="text-xs"
          >
            Tháng này
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCompareClick}
            className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            So sánh 2 kỳ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
