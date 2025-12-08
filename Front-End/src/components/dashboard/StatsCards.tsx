import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  growthRate: number;
}

export default function StatsCards({
  totalRevenue,
  totalOrders,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Doanh thu tháng này",
      value: `${totalRevenue.toLocaleString("vi-VN")} ₫`,
      change: "+3.0% so với tháng trước",
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-l-green-500",
    },
    {
      title: "Đơn hàng tháng này",
      value: totalOrders.toString(),
      change: "+12% so với tháng trước",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`border-l-4 ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
