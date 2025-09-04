import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Tổng doanh thu",
    value: "₫125,000,000",
    description: "+20.1% so với tháng trước",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    trend: "up"
  },
  {
    title: "Đơn hàng",
    value: "1,234",
    description: "+12% so với tháng trước",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    trend: "up"
  },
  {
    title: "Sản phẩm",
    value: "567",
    description: "+8% so với tháng trước",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    trend: "up"
  },
  {
    title: "Khách hàng",
    value: "890",
    description: "+15% so với tháng trước",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    trend: "up"
  }
]

export default function Dashboard() {
  return (
    <div className="space-y-3 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
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
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</CardTitle>
            <CardDescription className="text-gray-600">
              Biểu đồ doanh thu trong 12 tháng gần đây
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-base font-medium text-gray-500">Biểu đồ doanh thu</p>
                <p className="text-sm text-gray-400">Sử dụng thư viện biểu đồ như Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</CardTitle>
            <CardDescription className="text-gray-600">
              Những đơn hàng mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      Đơn hàng #{1000 + i}
                    </p>
                    <p className="text-sm text-gray-500">
                      Khách hàng {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₫{(500000 + i * 100000).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date().toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
