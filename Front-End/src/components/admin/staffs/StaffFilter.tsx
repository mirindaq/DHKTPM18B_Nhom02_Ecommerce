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
import type { UserRole } from "@/types/staff.type";

export default function StaffFilter({
  onSearch,
  roles = [],
}: {
  onSearch: (params: any) => void;
  roles?: UserRole[];
}) {
  const [filters, setFilters] = useState({
    staffName: "",
    email: "",
    phone: "",
    status: "",
    joinDate: "",
    roleId: "",
  });

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...filters,
      status: filters.status === "all" ? null : filters.status,
      roleId: filters.roleId === "all" || filters.roleId === "" ? null : parseInt(filters.roleId),
    };
    onSearch(payload);
  };

  const handleClearFilters = () => {
    setFilters({
      staffName: "",
      email: "",
      phone: "",
      status: "",
      joinDate: "",
      roleId: "",
    });
    onSearch({
      staffName: "",
      email: "",
      phone: "",
      status: null,
      joinDate: "",
      roleId: null,
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

        {/* Row 2: Date, Status and Role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Ngày vào làm</Label>
            <DatePicker
              id="filterJoinDate"
              value={filters.joinDate}
              placeholder="Chọn ngày vào làm"
              onChange={(val) => handleChange("joinDate", val)}
              className="w-full"
            />
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

          <div className="space-y-1">
            <Label htmlFor="filterRole" className="text-sm text-gray-600">
              Vai trò
            </Label>
            <Select
              value={filters.roleId}
              onValueChange={(val) => handleChange("roleId", val)}
            >
              <SelectTrigger id="filterRole" className="w-full">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
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
