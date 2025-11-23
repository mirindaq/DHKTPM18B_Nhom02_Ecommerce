import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import type {
  DeliveryAssignment,
  DeliveryStatus,
} from "@/types/delivery-assignment.type";

interface DeliveryTableProps {
  deliveries: DeliveryAssignment[];
  onViewDetail: (delivery: DeliveryAssignment) => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  DeliveryStatus,
  { label: string; icon: any; color: string }
> = {
  ASSIGNED: {
    label: "Đã gán",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DELIVERING: {
    label: "Đang giao",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  DELIVERED: {
    label: "Đã giao",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  FAILED: {
    label: "Thất bại",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function DeliveryTable({
  deliveries,
  onViewDetail,
  isLoading,
}: DeliveryTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-600">
          Chưa có đơn giao hàng nào
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Các đơn giao hàng sẽ hiển thị tại đây
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">
              Mã đơn
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Khách hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Số điện thoại
            </TableHead>
            <TableHead className="font-semibold text-gray-700 min-w-[200px]">
              Địa chỉ
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Trạng thái
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => {
            const StatusIcon =
              statusConfig[delivery.deliveryStatus]?.icon || Clock;
            const statusInfo =
              statusConfig[delivery.deliveryStatus] || statusConfig.ASSIGNED;

            return (
              <TableRow
                key={delivery.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium text-gray-900">
                  #{delivery.order?.id || "-"}
                </TableCell>
                <TableCell className="text-gray-700">
                  {delivery.order?.receiverName || "-"}
                </TableCell>
                <TableCell className="text-gray-600">
                  {delivery.order?.receiverPhone || "-"}
                </TableCell>
                <TableCell className="text-gray-600 max-w-xs">
                  <div className="line-clamp-2">
                    {delivery.order?.receiverAddress || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusInfo.color} border`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetail(delivery)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
