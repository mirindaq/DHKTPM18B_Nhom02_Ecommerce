import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Loader2,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { OrderResponse, OrderStatus } from "@/types/order.type";

interface OrderTableProps {
  orders: OrderResponse[];
  onViewDetail: (order: OrderResponse) => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: any; color: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    icon: Clock,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  PROCESSING: {
    label: "Đang xử lý",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  READY_FOR_PICKUP: {
    label: "Sẵn sàng lấy hàng",
    icon: Package,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  DELIVERING: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  SHIPPED: {
    label: "Chuẩn bị giao",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  FAILED: {
    label: "Thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  CANCELED: {
    label: "Đã hủy",
    icon: AlertCircle,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  PAYMENT_FAILED: {
    label: "Thanh toán thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  ASSIGNED_SHIPPER: {
    label: "Đã gán shipper",
    icon: Truck,
    color: "bg-teal-100 text-teal-800 border-teal-200",
  },
};

// const paymentMethodLabels: Record<string, string> = {
//   CASH_ON_DELIVERY: "Tiền mặt",
//   VN_PAY: "VNPay",
//   PAY_OS: "PayOS"
// };

export default function OrderTable({
  orders,
  onViewDetail,
  isLoading,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
}: OrderTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">STT</TableHead>
            <TableHead className="font-semibold text-gray-700">
              Mã đơn
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Khách hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              SĐT người nhận
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Tổng tiền
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Trạng thái
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Loại nhận hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Ngày đặt
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500 font-medium">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-24 text-gray-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      {searchTerm
                        ? "Không tìm thấy đơn hàng nào"
                        : "Chưa có đơn hàng nào"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchTerm
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Các đơn hàng sẽ hiển thị tại đây"}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              const statusInfo =
                statusConfig[order.status] || statusConfig.PENDING;

              return (
                <TableRow
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {order.receiverName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer?.email || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {order.receiverPhone}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatPrice(order.finalTotalPrice)}
                  </TableCell>
                  <TableCell>
                    <CustomBadge className={`${statusInfo.color} border`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <CustomBadge
                      variant={order.isPickup ? "info" : "secondary"}
                      className={
                        order.isPickup
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }
                    >
                      {order.isPickup ? "Nhận tại quầy" : "Giao hàng"}
                    </CustomBadge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(order.orderDate)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(order)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
