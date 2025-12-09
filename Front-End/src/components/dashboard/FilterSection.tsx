import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

export type TimeType = 'day' | 'month' | 'year'

export interface FilterValues {
  timeType: TimeType
  startDate?: string
  endDate?: string
  year?: number
  month?: number
}

interface FilterSectionProps {
  onFilter: (values: FilterValues) => void
}

export default function FilterSection({ onFilter }: FilterSectionProps) {
  const [timeType, setTimeType] = useState<TimeType>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1)

  const handleFilter = () => {
    onFilter({
      timeType,
      startDate: timeType === 'day' ? startDate : undefined,
      endDate: timeType === 'day' ? endDate : undefined,
      year: timeType !== 'day' ? year : undefined,
      month: timeType === 'month' ? month : undefined
    })
  }

  // Auto-trigger filter on mount with default values (current month)
  useEffect(() => {
    handleFilter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Bộ lọc thời gian</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kiểu thời gian */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Kiểu thời gian</label>
          <Select value={timeType} onValueChange={(value) => setTimeType(value as TimeType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic inputs based on timeType */}
        {timeType === 'day' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Từ ngày</label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Chọn từ ngày"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đến ngày</label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Chọn đến ngày"
              />
            </div>
          </>
        )}

        {timeType === 'month' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tháng</label>
              <Select value={month?.toString() || 'all'} onValueChange={(value) => setMonth(value === 'all' ? undefined : Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Năm</label>
              <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {timeType === 'year' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Năm</label>
            <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-6">
        <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          Lọc dữ liệu
        </Button>
      </div>
    </div>
  )
}
