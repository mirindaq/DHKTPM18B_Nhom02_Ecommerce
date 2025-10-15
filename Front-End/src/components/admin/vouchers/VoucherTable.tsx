import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Edit, ToggleLeft, ToggleRight, Loader2, Search, X } from "lucide-react";
import { format } from "date-fns";
import type { Voucher, VoucherType } from "@/types/voucher.type";

interface VoucherTableProps {
  vouchers: Voucher[];
  totalItems: number;
  onEdit: (voucher: Voucher) => void;
  onToggleStatus: (id: number) => void;
  isLoading: boolean;
  onSearch: (searchTerm: string) => void;
  onFilter: (filters: {
    type?: string;
    active?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export default function VoucherTable({
  vouchers,
  totalItems,
  onEdit,
  onToggleStatus,
  isLoading,
  onSearch,
  onFilter,
}: VoucherTableProps) {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    active: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: filters.name,
      type: filters.type === "all" ? undefined : filters.type,
      active: filters.active === "all" ? undefined : filters.active === "true",
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    onFilter(payload);
    onSearch(filters.name);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      type: "",
      active: "",
      startDate: "",
      endDate: "",
    });
    onSearch("");
    onFilter({});
  };

  const getVoucherTypeLabel = (type: VoucherType) => {
    switch (type) {
      case "ALL":
        return "Tất cả";
      case "GROUP":
        return "Nhóm khách hàng";
      case "RANK":
        return "Rank";
      default:
        return type;
    }
  };

  const getVoucherTypeBadgeVariant = (type: VoucherType) => {
    switch (type) {
      case "ALL":
        return "default";
      case "GROUP":
        return "destructive";
      case "RANK":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };


  const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.active) {
      return { text: "Chưa phát hành", variant: "secondary", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
    
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    
    if (now < startDate) {
      return { text: "Chưa hoạt động", variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    } else if (now > endDate) {
      return { text: "Hết hạn", variant: "secondary", color: "bg-red-100 text-red-800 border-red-200" };
    } else {
      return { text: "Đang hoạt động", variant: "default", color: "bg-green-100 text-green-800 border-green-200" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-base mb-4">Bộ lọc tìm kiếm</h2>
          
          {/* Row 1: Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="filterName" className="text-sm text-gray-600">
                Tên voucher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="filterName"
                  placeholder="Nhập tên voucher..."
                  value={filters.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filterType" className="text-sm text-gray-600">
                Loại voucher
              </Label>
              <Select
                value={filters.type}
                onValueChange={(val) => handleChange("type", val)}
              >
                <SelectTrigger id="filterType" className="w-full">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="GROUP">Nhóm khách hàng</SelectItem>
                  <SelectItem value="RANK">Rank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <Label className="text-sm text-gray-600">Ngày áp dụng</Label>
              <div className="flex items-center gap-4">
                <DatePicker
                  id="filterStartDate"
                  value={filters.startDate}
                  placeholder="Từ ngày"
                  onChange={(val) => handleChange("startDate", val)}
                  className="w-full"
                />
                <DatePicker
                  id="filterEndDate"
                  value={filters.endDate}
                  placeholder="Đến ngày"
                  onChange={(val) => handleChange("endDate", val)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filterActive" className="text-sm text-gray-600">
                Trạng thái
              </Label>
              <Select
                value={filters.active}
                onValueChange={(val) => handleChange("active", val)}
              >
                <SelectTrigger id="filterActive" className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="px-4"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
            <Button 
              type="submit" 
              className="px-6 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-1" />
              Tìm kiếm
            </Button>
          </div>
        </form>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Tổng cộng: <span className="font-semibold text-gray-900">{totalItems}</span> voucher
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Tên voucher</TableHead>
              <TableHead className="font-semibold text-gray-700">Loại</TableHead>
              <TableHead className="font-semibold text-gray-700">Giảm</TableHead>
              <TableHead className="font-semibold text-gray-700">Đơn tối thiểu</TableHead>
              <TableHead className="font-semibold text-gray-700">Giảm tối đa</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày bắt đầu</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày kết thúc</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {filters.name ? "Không tìm thấy voucher nào" : "Chưa có voucher nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {filters.name ? "Thử tìm kiếm với từ khóa khác" : "Hãy thêm voucher đầu tiên"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-semibold text-gray-900">
                    <div>
                      <div>{voucher.name}</div>
                      {voucher.voucherType === "GROUP" && voucher.voucherCustomers && voucher.voucherCustomers.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {voucher.voucherCustomers.length} khách hàng
                          {voucher.voucherCustomers.some(vc => vc.voucherCustomerStatus === 'SENT') && (
                            <span className="ml-2 text-green-600">• Đã gửi</span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVoucherTypeBadgeVariant(voucher.voucherType)}>
                      {getVoucherTypeLabel(voucher.voucherType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {`${voucher.discount}%`}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {voucher.minOrderAmount > 0 ? formatCurrency(voucher.minOrderAmount) : "Không có"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {voucher.maxDiscountAmount > 0 ? formatCurrency(voucher.maxDiscountAmount) : "Không giới hạn"}
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(voucher.startDate)}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(voucher.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getVoucherStatus(voucher).variant as "default" | "secondary"} className={getVoucherStatus(voucher).color}>
                      {getVoucherStatus(voucher).text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(voucher)}
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        disabled={isLoading}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(voucher.id)}
                        disabled={isLoading}
                        className={`${
                          voucher.active 
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }`}
                        title={voucher.active ? "Tắt trạng thái" : "Bật trạng thái"}
                      >
                        {voucher.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
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
