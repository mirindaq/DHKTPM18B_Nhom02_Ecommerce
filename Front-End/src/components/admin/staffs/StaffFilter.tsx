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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <h2 className="font-semibold text-gray-700 text-base mb-4">Bộ lọc tìm kiếm</h2>
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
            <div className="flex items-center gap-4">
              {" "}
              <DatePicker
                id="filterStartDate"
                value={filters.startDate}
                placeholder="Từ ngày"
                onChange={(val) => handleChange("startDate", val)}
                className="w-full" // đổi từ flex-1 thành w-full
              />
              <DatePicker
                id="filterEndDate"
                value={filters.endDate}
                placeholder="Đến ngày"
                onChange={(val) => handleChange("endDate", val)}
                className="w-full" // đổi từ flex-1 thành w-full
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
              <SelectTrigger id="filterStatus" className="w-full">
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
          <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-1" />
            Tìm kiếm
          </Button>
        </div>
      </form>
    </div>
  );
}
