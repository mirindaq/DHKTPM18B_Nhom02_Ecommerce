import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

export default function StaffFilter({
  onSearch,
}: {
  onSearch: (params: any) => void;
}) {
  const [filters, setFilters] = useState({
    staffName: "",
    email: "",
    phone: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...filters,
      status: filters.status === "all" ? null : filters.status,
    };
    onSearch(payload);
  };

  const handleClearFilters = () => {
    setFilters({
      staffName: "",
      email: "",
      phone: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    onSearch({
      staffName: "",
      email: "",
      phone: "",
      status: null,
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">Tìm kiếm nhân viên</h3>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700 h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Row 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="filterStaffName" className="text-sm text-gray-600">
              Tên nhân viên
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="filterStaffName"
                placeholder="Nhập tên..."
                value={filters.staffName}
                onChange={(e) => handleChange("staffName", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filterEmail" className="text-sm text-gray-600">
              Email
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="filterEmail"
                placeholder="Nhập email..."
                value={filters.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filterPhone" className="text-sm text-gray-600">
              Số điện thoại
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="filterPhone"
                placeholder="Nhập số điện thoại..."
                value={filters.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Date and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-sm text-gray-600">Ngày vào làm</Label>
            <div className="flex items-center gap-2">
              <DatePicker
                id="filterStartDate"
                value={filters.startDate}
                placeholder="Từ ngày"
                onChange={(val) => handleChange("startDate", val)}
                className="flex-1"
              />
              <DatePicker
                id="filterEndDate"
                value={filters.endDate}
                placeholder="Đến ngày"
                onChange={(val) => handleChange("endDate", val)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="filterStatus" className="text-sm text-gray-600">
              Trạng thái
            </Label>
            <Select
              value={filters.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger id="filterStatus">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Ngừng hoạt động</SelectItem>
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
          >
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
          <Button
            type="submit"
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4 mr-1" />
            Tìm kiếm
          </Button>
        </div>
      </form>
    </div>
  );
}
