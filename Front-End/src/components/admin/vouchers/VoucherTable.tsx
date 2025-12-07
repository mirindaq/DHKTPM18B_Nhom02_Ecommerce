import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/CustomBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  Search,
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import type { Voucher, VoucherType } from "@/types/voucher.type";

interface VoucherTableProps {
  vouchers: Voucher[];
  totalItems: number;
  onEdit: (voucher: Voucher) => void;
  onToggleStatus: (id: number) => void;
  isLoading: boolean;
  currentPage?: number;
  pageSize?: number;
}

export default function VoucherTable({
  vouchers,
  onEdit,
  onToggleStatus,
  isLoading,
  currentPage = 1,
  pageSize = 7,
}: VoucherTableProps) {

  const getTypeConfig = (type: VoucherType) => {
    const configs = {
      ALL: { label: "Tất cả", icon: Tag, color: "bg-gray-100 text-gray-800 border-gray-200" },
      GROUP: { label: "Nhóm khách hàng", icon: Tag, color: "bg-purple-100 text-purple-800 border-purple-200" },
      RANK: { label: "Rank", icon: Tag, color: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    return configs[type] || configs.ALL;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getVoucherStatus = (voucher: Voucher) => {
    // Nếu active = false → Tạm dừng
    if (!voucher.active) {
      return {
        label: "Tạm dừng",
        icon: XCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      };
    }

    // Nếu active = true, kiểm tra thời gian
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(voucher.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(voucher.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Chưa bắt đầu
    if (today < startDate) {
      return {
        label: "Chưa bắt đầu",
        icon: Clock,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }

    // Hết hạn
    if (today > endDate) {
      return {
        label: "Hết hạn",
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
      };
    }

    // Đang hoạt động
    return {
      label: "Hoạt động",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
    };
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">STT</TableHead>
            <TableHead className="font-semibold text-gray-700">Tên voucher</TableHead>
            <TableHead className="font-semibold text-gray-700">Loại</TableHead>
            <TableHead className="font-semibold text-gray-700">Giảm giá</TableHead>
            <TableHead className="font-semibold text-gray-700">Đơn tối thiểu</TableHead>
            <TableHead className="font-semibold text-gray-700">Giảm tối đa</TableHead>
            <TableHead className="font-semibold text-gray-700">Thời gian</TableHead>
            <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
            <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-24 text-gray-500">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      Không có voucher nào
                    </p>
                    <p className="text-sm text-gray-400">
                      Các voucher sẽ hiển thị tại đây
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher, index) => {
              const typeConfig = getTypeConfig(voucher.voucherType);
              const TypeIcon = typeConfig.icon;
              const statusConfig = getVoucherStatus(voucher);
              const StatusIcon = statusConfig.icon;
              
              return (
                <TableRow key={voucher.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{voucher.name}</div>
                      {voucher.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">
                          {voucher.description}
                        </div>
                      )}
                      {voucher.voucherType === "GROUP" && voucher.voucherCustomers && voucher.voucherCustomers.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {voucher.voucherCustomers.length} khách hàng
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomBadge className={`${typeConfig.color} border`}>
                      <TypeIcon className="mr-1 h-3 w-3" />
                      {typeConfig.label}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      {`${voucher.discount}%`}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {voucher.minOrderAmount > 0 ? formatCurrency(voucher.minOrderAmount) : "Không có"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {voucher.maxDiscountAmount > 0 ? formatCurrency(voucher.maxDiscountAmount) : "Không giới hạn"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div>{formatDate(voucher.startDate)}</div>
                      <div className="text-gray-500">đến {formatDate(voucher.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomBadge className={`${statusConfig.color} border`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(voucher)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(voucher.id)}>
                          {voucher.active ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Tạm dừng
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
