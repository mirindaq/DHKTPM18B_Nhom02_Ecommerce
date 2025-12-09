import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserPlus } from "lucide-react";
import type { OrderResponse } from "@/types/order.type";

interface OrderAssignmentTableProps {
  orders: OrderResponse[];
  onAssignShipper: (order: OrderResponse) => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
}

export default function OrderAssignmentTable({
  orders,
  onAssignShipper,
  isLoading = false,
  currentPage = 1,
  pageSize = 10,
}: OrderAssignmentTableProps) {
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
              Người nhận
            </TableHead>
            <TableHead className="font-semibold text-gray-700">SĐT</TableHead>
            <TableHead className="font-semibold text-gray-700">
              Địa chỉ
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Tổng tiền
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
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  <p className="text-gray-500 font-medium">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-24 text-gray-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      Không có đơn hàng cần gán shipper
                    </p>
                    <p className="text-sm text-gray-400">
                      Các đơn hàng có trạng thái SHIPPED sẽ hiển thị tại đây
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
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
                <TableCell className="max-w-xs">
                  <p
                    className="text-gray-600 truncate"
                    title={order.receiverAddress}
                  >
                    {order.receiverAddress || "N/A"}
                  </p>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatPrice(order.finalTotalPrice)}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(order.orderDate)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onAssignShipper(order)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Gán shipper
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
