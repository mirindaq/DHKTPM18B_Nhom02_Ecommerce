import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import type { RevenueByMonthResponse, RevenueByDayResponse, RevenueByYearResponse } from '@/types/dashboard.type'

interface RevenueCardProps {
  data: RevenueByMonthResponse[] | RevenueByDayResponse[] | RevenueByYearResponse[]
  timeType: 'day' | 'month' | 'year'
  loading?: boolean
}

export default function RevenueCard({ data, timeType, loading }: RevenueCardProps) {
  // Format data cho biểu đồ
  const chartData = data.map((item) => {
    if ('month' in item) {
      return {
        name: `T${item.month}`,
        'Doanh thu': item.revenue,
        'Đơn hàng': item.orderCount
      }
    } else if ('date' in item) {
      return {
        name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        'Doanh thu': item.revenue,
        'Đơn hàng': item.orderCount
      }
    } else {
      return {
        name: `${item.year}`,
        'Doanh thu': item.revenue,
        'Đơn hàng': item.orderCount
      }
    }
  })

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0)

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Doanh thu theo {timeType === 'day' ? 'ngày' : timeType === 'month' ? 'tháng' : 'năm'}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Biểu đồ doanh thu trong {data.length} {timeType === 'day' ? 'ngày' : timeType === 'month' ? 'tháng' : 'năm'} gần đây
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Biểu đồ */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            {timeType === 'day' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#3b82f6"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Doanh thu') {
                      return [`${value.toLocaleString('vi-VN')} ₫`, name]
                    }
                    return [value, name]
                  }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="Doanh thu" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="Đơn hàng" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#3b82f6"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Doanh thu') {
                      return [`${value.toLocaleString('vi-VN')} ₫`, name]
                    }
                    return [value, name]
                  }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Doanh thu" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="Đơn hàng" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bảng chi tiết */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {timeType === 'day' ? 'Ngày' : timeType === 'month' ? 'Tháng' : 'Năm'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TB/Đơn
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => {
                  const avgPerOrder = item.orderCount > 0 ? item.revenue / item.orderCount : 0
                  let displayName = ''
                  if ('month' in item) {
                    displayName = `Tháng ${item.month}/${item.year}`
                  } else if ('date' in item) {
                    displayName = new Date(item.date).toLocaleDateString('vi-VN')
                  } else {
                    displayName = `Năm ${item.year}`
                  }
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {displayName}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                        {item.revenue.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {item.orderCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {avgPerOrder.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    Tổng cộng
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                    {totalRevenue.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {totalOrders}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-600">
                    {(totalRevenue / totalOrders).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
