import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TopVoucherResponse } from '@/types/voucher-promotion.type'

// Badge component inline
const Badge = ({ className, children, variant }: { className?: string; children: React.ReactNode; variant?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
)

interface TopVouchersTableProps {
  vouchers: TopVoucherResponse[]
}

export default function TopVouchersTable({ vouchers }: TopVouchersTableProps) {
  const getPerformanceBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 Top 1</Badge>
    if (index === 1) return <Badge className="bg-gray-400">🥈 Top 2</Badge>
    if (index === 2) return <Badge className="bg-orange-600">🥉 Top 3</Badge>
    return <Badge variant="outline">Top {index + 1}</Badge>
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Top 5 Vouchers hiệu quả nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Xếp hạng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã Voucher</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tên Voucher</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lần dùng</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tổng giảm giá</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher, index) => (
                  <tr 
                    key={voucher.voucherId} 
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      {getPerformanceBadge(index)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {voucher.voucherCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{voucher.voucherName}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {voucher.usageCount.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {voucher.totalDiscountAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
