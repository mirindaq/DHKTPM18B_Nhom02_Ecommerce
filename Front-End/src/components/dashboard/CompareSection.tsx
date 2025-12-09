/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GitCompare, X } from "lucide-react";
import type {
  RevenueByMonthResponse,
  RevenueByDayResponse,
  RevenueByYearResponse,
} from "@/types/dashboard.type";

interface CompareSectionProps {
  onCompare: (period1: CompareParams, period2: CompareParams) => void;
  onClose: () => void;
  data1?:
    | RevenueByMonthResponse[]
    | RevenueByDayResponse[]
    | RevenueByYearResponse[];
  data2?:
    | RevenueByMonthResponse[]
    | RevenueByDayResponse[]
    | RevenueByYearResponse[];
  loading?: boolean;
}

export interface CompareParams {
  timeType: "day" | "month" | "year";
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

export default function CompareSection({
  onCompare,
  onClose,
  data1,
  data2,
  loading,
}: CompareSectionProps) {
  const [period1, setPeriod1] = useState<CompareParams>({
    timeType: "month",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [period2, setPeriod2] = useState<CompareParams>({
    timeType: "month",
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const handleCompare = () => {
    onCompare(period1, period2);
  };

  const calculateTotal = (
    data?:
      | RevenueByMonthResponse[]
      | RevenueByDayResponse[]
      | RevenueByYearResponse[]
  ) => {
    if (!data) return { revenue: 0, orders: 0 };
    return {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      orders: data.reduce((sum, item) => sum + item.orderCount, 0),
    };
  };

  const total1 = calculateTotal(data1);
  const total2 = calculateTotal(data2);
  const revenueDiff = total1.revenue - total2.revenue;
  const ordersDiff = total1.orders - total2.orders;
  const revenuePercent =
    total2.revenue > 0 ? (revenueDiff / total2.revenue) * 100 : 0;

  return (
    <Card className="mb-6 border-2 border-purple-200 bg-purple-50/30">
      <CardHeader className="border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-bold text-gray-900">
              Chế độ so sánh
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Period selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Period 1 */}
          <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900">Kỳ 1</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kiểu thời gian
              </label>
              <Select
                value={period1.timeType}
                onValueChange={(value) =>
                  setPeriod1({ ...period1, timeType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo ngày</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                  <SelectItem value="year">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period1.timeType === "day" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Từ ngày
                  </label>
                  <DatePicker
                    value={period1.startDate}
                    onChange={(value) =>
                      setPeriod1({ ...period1, startDate: value })
                    }
                    placeholder="Chọn từ ngày"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Đến ngày
                  </label>
                  <DatePicker
                    value={period1.endDate}
                    onChange={(value) =>
                      setPeriod1({ ...period1, endDate: value })
                    }
                    placeholder="Chọn đến ngày"
                  />
                </div>
              </>
            )}

            {period1.timeType === "month" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tháng
                  </label>
                  <Select
                    value={period1.month?.toString()}
                    onValueChange={(value) =>
                      setPeriod1({ ...period1, month: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          Tháng {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Năm
                  </label>
                  <Select
                    value={period1.year?.toString()}
                    onValueChange={(value) =>
                      setPeriod1({ ...period1, year: Number(value) })
                    }
                  >
                    <SelectTrigger>
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

            {period1.timeType === "year" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Năm</label>
                <Select
                  value={period1.year?.toString()}
                  onValueChange={(value) =>
                    setPeriod1({ ...period1, year: Number(value) })
                  }
                >
                  <SelectTrigger>
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

          {/* Period 2 */}
          <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900">Kỳ 2</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kiểu thời gian
              </label>
              <Select
                value={period2.timeType}
                onValueChange={(value) =>
                  setPeriod2({ ...period2, timeType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo ngày</SelectItem>
                  <SelectItem value="month">Theo tháng</SelectItem>
                  <SelectItem value="year">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period2.timeType === "day" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Từ ngày
                  </label>
                  <DatePicker
                    value={period2.startDate}
                    onChange={(value) =>
                      setPeriod2({ ...period2, startDate: value })
                    }
                    placeholder="Chọn từ ngày"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Đến ngày
                  </label>
                  <DatePicker
                    value={period2.endDate}
                    onChange={(value) =>
                      setPeriod2({ ...period2, endDate: value })
                    }
                    placeholder="Chọn đến ngày"
                  />
                </div>
              </>
            )}

            {period2.timeType === "month" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tháng
                  </label>
                  <Select
                    value={period2.month?.toString()}
                    onValueChange={(value) =>
                      setPeriod2({ ...period2, month: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          Tháng {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Năm
                  </label>
                  <Select
                    value={period2.year?.toString()}
                    onValueChange={(value) =>
                      setPeriod2({ ...period2, year: Number(value) })
                    }
                  >
                    <SelectTrigger>
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

            {period2.timeType === "year" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Năm</label>
                <Select
                  value={period2.year?.toString()}
                  onValueChange={(value) =>
                    setPeriod2({ ...period2, year: Number(value) })
                  }
                >
                  <SelectTrigger>
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
        </div>

        <Button
          onClick={handleCompare}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? "Đang so sánh..." : "So sánh ngay"}
        </Button>

        {/* Comparison results */}
        {data1 && data2 && !loading && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">
              Kết quả so sánh
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Chỉ tiêu
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Kỳ 1
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Kỳ 2
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Chênh lệch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Doanh thu
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {total1.revenue.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {total2.revenue.toLocaleString("vi-VN")} ₫
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-semibold ${
                        revenueDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {revenueDiff >= 0 ? "+" : ""}
                      {revenueDiff.toLocaleString("vi-VN")} ₫
                      <span className="text-xs ml-1">
                        ({revenuePercent >= 0 ? "+" : ""}
                        {revenuePercent.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Đơn hàng
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {total1.orders}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {total2.orders}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-semibold ${
                        ordersDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {ordersDiff >= 0 ? "+" : ""}
                      {ordersDiff}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
