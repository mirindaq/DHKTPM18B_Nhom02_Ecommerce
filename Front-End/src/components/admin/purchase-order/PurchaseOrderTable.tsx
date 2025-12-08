import { Eye, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PurchaseOrder } from "@/types/purchase-order.type";

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  onViewDetail: (purchaseOrder: PurchaseOrder) => void;
  currentPage: number;
  pageSize: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return dateString;
};

export default function PurchaseOrderTable({
  purchaseOrders,
  isLoading,
  onViewDetail,
  currentPage,
  pageSize,
}: PurchaseOrderTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">STT</TableHead>
            <TableHead className="font-semibold text-gray-700">Mã phiếu</TableHead>
            <TableHead className="font-semibold text-gray-700">Nhà cung cấp</TableHead>
            <TableHead className="font-semibold text-gray-700">Ngày nhập</TableHead>
            <TableHead className="font-semibold text-gray-700">Người tạo</TableHead>
            <TableHead className="font-semibold text-gray-700">Tổng tiền</TableHead>
            <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500 font-medium">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : purchaseOrders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-24 text-gray-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      Chưa có phiếu nhập hàng nào
                    </p>
                    <p className="text-sm text-gray-400">
                      Hãy tạo phiếu nhập hàng đầu tiên
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            purchaseOrders.map((po, index) => (
              <TableRow
                key={po.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <TableCell className="text-center font-medium text-gray-600">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                    PO-{po.id}
                  </code>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-gray-900">{po.supplier.name}</p>
                    <p className="text-xs text-gray-500">ID: {po.supplier.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatDate(po.purchaseDate)}
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-gray-900">
                    {po.staff?.email || "N/A"}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
                    {formatPrice(po.totalPrice)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetail(po)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4" />
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
