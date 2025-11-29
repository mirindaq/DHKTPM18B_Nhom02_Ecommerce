import { Eye } from "lucide-react";
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
  // Backend trả về format: "HH:mm dd/MM/yyyy"
  // Chỉ cần hiển thị trực tiếp
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
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">STT</TableHead>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Nhà cung cấp</TableHead>
            <TableHead>Ngày nhập</TableHead>
            <TableHead>Người tạo</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : purchaseOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Chưa có đơn hàng nào</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Các đơn hàng sẽ hiển thị tại đây
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            purchaseOrders.map((po, index) => (
            <TableRow key={po.id}>
              <TableCell className="font-medium">
                {po.id}
              </TableCell>
              <TableCell className="font-mono text-sm">PO-{po.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{po.supplier.name}</p>
                  <p className="text-sm text-gray-500">ID: {po.supplier.id}</p>
                </div>
              </TableCell>
              <TableCell>{formatDate(po.purchaseDate)}</TableCell>
              <TableCell>{po.staff.name}</TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatPrice(po.totalPrice)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(po)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
