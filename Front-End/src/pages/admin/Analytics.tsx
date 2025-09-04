import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const monthlyData = [
  { month: "T1", revenue: 45000000, orders: 120, customers: 85 },
  { month: "T2", revenue: 52000000, orders: 135, customers: 92 },
  { month: "T3", revenue: 48000000, orders: 128, customers: 88 },
  { month: "T4", revenue: 61000000, orders: 156, customers: 105 },
  { month: "T5", revenue: 58000000, orders: 142, customers: 98 },
  { month: "T6", revenue: 67000000, orders: 168, customers: 115 },
  { month: "T7", revenue: 72000000, orders: 185, customers: 125 },
  { month: "T8", revenue: 68000000, orders: 172, customers: 118 },
  { month: "T9", revenue: 75000000, orders: 190, customers: 130 },
  { month: "T10", revenue: 82000000, orders: 205, customers: 140 },
  { month: "T11", revenue: 78000000, orders: 195, customers: 135 },
  { month: "T12", revenue: 85000000, orders: 220, customers: 150 }
]

const topProducts = [
  { name: "iPhone 15 Pro", sales: 45, revenue: 1125000000, growth: 12.5 },
  { name: "MacBook Air M2", sales: 32, revenue: 1120000000, growth: 8.2 },
  { name: "AirPods Pro", sales: 78, revenue: 507000000, growth: 15.3 },
  { name: "iPad Air", sales: 28, revenue: 840000000, growth: 6.8 },
  { name: "Apple Watch", sales: 35, revenue: 700000000, growth: 10.1 }
]

const topCategories = [
  { name: "Điện thoại", revenue: 2500000000, growth: 15.2, percentage: 35 },
  { name: "Laptop", revenue: 2000000000, growth: 12.8, percentage: 28 },
  { name: "Phụ kiện", revenue: 1200000000, growth: 18.5, percentage: 17 },
  { name: "Máy tính bảng", revenue: 1000000000, growth: 8.9, percentage: 14 },
  { name: "Đồng hồ thông minh", revenue: 400000000, growth: 22.1, percentage: 6 }
]

export default function Analytics() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth()
    return monthlyData[currentMonth]
  }

  const getPreviousMonthData = () => {
    const previousMonth = new Date().getMonth() - 1
    return monthlyData[previousMonth >= 0 ? previousMonth : 11]
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  const currentMonth = getCurrentMonthData()
  const previousMonth = getPreviousMonthData()

  const revenueGrowth = calculateGrowth(currentMonth.revenue, previousMonth.revenue)
  const ordersGrowth = calculateGrowth(currentMonth.orders, previousMonth.orders)
  const customersGrowth = calculateGrowth(currentMonth.customers, previousMonth.customers)

  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thống kê & Phân tích</h1>
        <p className="text-lg text-gray-600">
          Theo dõi hiệu suất kinh doanh và xu hướng thị trường
        </p>
      </div>

      {/* Tổng quan tháng hiện tại */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Doanh thu tháng này
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatPrice(currentMonth.revenue)}</div>
            <div className="flex items-center text-sm text-gray-500">
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-2" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}% so với tháng trước
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đơn hàng tháng này
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatNumber(currentMonth.orders)}</div>
            <div className="flex items-center text-sm text-gray-500">
              {ordersGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-2" />
              )}
              {Math.abs(ordersGrowth).toFixed(1)}% so với tháng trước
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Khách hàng mới
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatNumber(currentMonth.customers)}</div>
            <div className="flex items-center text-sm text-gray-500">
              {customersGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-2" />
              )}
              {Math.abs(customersGrowth).toFixed(1)}% so với tháng trước
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tỷ lệ chuyển đổi
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-2">3.2%</div>
            <div className="flex items-center text-sm text-gray-500">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-2" />
              +0.5% so với tháng trước
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Xu hướng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</CardTitle>
                <CardDescription className="text-gray-600">
                  Biểu đồ doanh thu trong 12 tháng gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-base font-medium text-gray-500">Biểu đồ doanh thu theo tháng</p>
                    <p className="text-sm text-gray-400">Sử dụng thư viện biểu đồ như Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Thống kê nhanh</CardTitle>
                <CardDescription className="text-gray-600">
                  Các chỉ số quan trọng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm font-medium text-gray-600">Tổng doanh thu năm</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(monthlyData.reduce((sum, month) => sum + month.revenue, 0))}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm font-medium text-gray-600">Tổng đơn hàng năm</span>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(monthlyData.reduce((sum, month) => sum + month.orders, 0))}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm font-medium text-gray-600">Khách hàng mới năm</span>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(monthlyData.reduce((sum, month) => sum + month.customers, 0))}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm font-medium text-gray-600">Trung bình/đơn hàng</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(monthlyData.reduce((sum, month) => sum + month.revenue, 0) / monthlyData.reduce((sum, month) => sum + month.orders, 0))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy nhất</CardTitle>
              <CardDescription className="text-gray-600">
                Top 5 sản phẩm có doanh số cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(product.sales)} đơn vị bán ra
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatPrice(product.revenue)}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        {product.growth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        {Math.abs(product.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Hiệu suất theo danh mục</CardTitle>
              <CardDescription className="text-gray-600">
                Phân tích doanh thu theo từng danh mục sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500 font-medium">
                        {category.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">
                        {formatPrice(category.revenue)}
                      </span>
                      <div className="flex items-center">
                        {category.growth >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        <span className="font-medium">{Math.abs(category.growth)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Xu hướng đơn hàng</CardTitle>
                <CardDescription className="text-gray-600">
                  Phân tích xu hướng đặt hàng theo thời gian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Biểu đồ xu hướng đơn hàng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Phân tích khách hàng</CardTitle>
                <CardDescription className="text-gray-600">
                  Thống kê về hành vi khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Biểu đồ phân tích khách hàng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
