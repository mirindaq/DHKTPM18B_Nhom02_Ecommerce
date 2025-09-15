import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, PowerOff, Loader2, Search } from "lucide-react";
import type { CustomerSummary } from "@/types/customer.type";

interface CustomerTableProps {
  customers: CustomerSummary[];
  onEdit: (customer: CustomerSummary) => void;
  onDelete?: (id: number) => void;
  onViewDetail: (customer: CustomerSummary) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function CustomerTable({
  customers,
  onEdit,
  onViewDetail,
  onToggleStatus,
  isLoading = false,
  currentPage = 1,
  pageSize = 7,
}: CustomerTableProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Tổng cộng:{" "}
        <span className="font-semibold text-gray-900">{customers.length}</span>{" "}
        khách hàng
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-center font-semibold">STT</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold">Liên hệ</TableHead>
              <TableHead className="font-semibold">Địa chỉ</TableHead>
              <TableHead className="font-semibold">Tổng chi tiêu</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Ngày tham gia</TableHead>
              <TableHead className="font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-24 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        Chưa có khách hàng nào
                      </p>
                      <p className="text-sm text-gray-400">
                        Hãy thêm khách hàng đầu tiên
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {customer.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-600">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone || "—"}</div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {customer.address || "—"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatPrice(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {customer.active ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(customer.registerDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(customer)}
                        disabled={isLoading}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        disabled={isLoading}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(customer.id)}
                        disabled={isLoading}
                        className={
                          customer.active
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }
                      >
                        {customer.active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
