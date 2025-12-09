import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TopProductResponse } from "@/types/dashboard.type";
import { Package, Eye, List } from "lucide-react";

interface TopProductsCardProps {
  data: TopProductResponse[];
  loading?: boolean;
  onViewDetail?: (productId: number) => void;
  onViewAll?: () => void;
}

export default function TopProductsCard({
  data,
  loading,
  onViewDetail,
  onViewAll,
}: TopProductsCardProps) {
  // Format data cho biểu đồ
  const chartData = data.map((item, index) => ({
    name: `#${index + 1}`,
    productName: item.productName,
    "Số lượng bán": item.totalQuantitySold,
    "Doanh thu": item.totalRevenue,
  }));

  const totalQuantity = data.reduce(
    (sum, item) => sum + item.totalQuantitySold,
    0
  );
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Top 5 sản phẩm bán chạy
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Sản phẩm có doanh số cao nhất
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Xem tất cả
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Biểu đồ */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item ? item.productName : label;
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Doanh thu") {
                    return [`${value.toLocaleString("vi-VN")} ₫`, name];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="Số lượng bán"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-3">
          {data.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              {/* Ranking badge */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : index === 1
                    ? "bg-gray-100 text-gray-700"
                    : index === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                #{index + 1}
              </div>

              {/* Product image */}
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/56?text=No+Image";
                }}
              />

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.productName}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600">
                    Đã bán:{" "}
                    <span className="font-semibold text-purple-600">
                      {product.totalQuantitySold}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">
                    Doanh thu:{" "}
                    <span className="font-semibold text-green-600">
                      {product.totalRevenue.toLocaleString("vi-VN")} ₫
                    </span>
                  </span>
                </div>
              </div>

              {/* View detail button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetail?.(product.productId)}
                className="flex-shrink-0 gap-2"
              >
                <Eye className="h-4 w-4" />
                Chi tiết
              </Button>
            </div>
          ))}

          {data.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có dữ liệu sản phẩm</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {data.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tổng số lượng</p>
                <p className="text-xl font-bold text-purple-600">
                  {totalQuantity}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-xl font-bold text-green-600">
                  {(totalRevenue / 1000000).toFixed(1)}M ₫
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
