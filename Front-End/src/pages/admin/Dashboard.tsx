import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { dashboardService } from "@/services/dashboard.service"
import type { DashboardStatsResponse } from "@/types/dashboard.type"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy stats từ đầu tháng đến hiện tại
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startDate = startOfMonth.toISOString().split('T')[0]
        const endDate = now.toISOString().split('T')[0]
        
        const response = await dashboardService.getDashboardStats(startDate, endDate)
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }

    fetchStats()
  }, [])

  const statsCards = [
    {
      title: "Tổng doanh thu",
      value: stats ? `₫${stats.totalRevenue.toLocaleString('vi-VN')}` : "...",
      description: stats ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% so với kỳ trước` : "...",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      trend: stats && stats.revenueGrowth >= 0 ? "up" : "down"
    },
    {
      title: "Đơn hàng",
      value: stats ? stats.totalOrders.toString() : "...",
      description: stats ? `${stats.ordersGrowth >= 0 ? '+' : ''}${stats.ordersGrowth.toFixed(1)}% so với kỳ trước` : "...",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: stats && stats.ordersGrowth >= 0 ? "up" : "down"
    },
    {
      title: "Sản phẩm",
      value: stats ? stats.totalProducts.toString() : "...",
      description: stats ? `${stats.productsGrowth >= 0 ? '+' : ''}${stats.productsGrowth.toFixed(1)}% so với kỳ trước` : "...",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      trend: stats && stats.productsGrowth >= 0 ? "up" : "down"
    },
    {
      title: "Khách hàng",
      value: stats ? stats.totalCustomers.toString() : "...",
      description: stats ? `${stats.customersGrowth >= 0 ? '+' : ''}${stats.customersGrowth.toFixed(1)}% so với kỳ trước` : "...",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      trend: stats && stats.customersGrowth >= 0 ? "up" : "down"
    }
  ]
  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Doanh thu theo tháng
            </CardTitle>
            <CardDescription className="text-gray-600">
              Biểu đồ doanh thu trong 12 tháng gần đây
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {revenueData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Chưa có dữ liệu doanh thu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="blackGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#000000" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#000000"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#blackGradient)"
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Đơn hàng hoàn thành gần đây
            </CardTitle>
            <CardDescription className="text-gray-600">
              {recentOrders.length > 0
                ? `${recentOrders.length} đơn hàng mới nhất`
                : "Chưa có đơn hàng nào"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-4 text-gray-500 italic">
                  Không có dữ liệu
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900">
                        Đơn hàng #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.receiverName || "Khách lẻ"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.finalTotalPrice)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
