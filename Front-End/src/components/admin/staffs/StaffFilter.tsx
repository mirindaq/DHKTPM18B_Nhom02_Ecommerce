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
import { Search } from "lucide-react";
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-2xl shadow"
    >
      {/* Row 1: StaffName, Email, Phone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="filterStaffName"
            placeholder="Tìm theo tên..."
            value={filters.staffName}
            onChange={(e) => handleChange("staffName", e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="filterEmail"
            placeholder="Tìm theo email..."
            value={filters.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="filterPhone"
            placeholder="Tìm theo số điện thoại..."
            value={filters.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Row 2: StartDate → EndDate + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ngày vào làm (chiếm 2/3) */}
        <div className="md:col-span-2">
          <Label className="mb-1 block">Ngày vào làm</Label>
          <div className="flex items-center gap-2 w-full">
            <DatePicker
              id="filterStartDate"
              value={filters.startDate}
              placeholder="Từ ngày"
              onChange={(val) => handleChange("startDate", val)}
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-500">→</span>
            <DatePicker
              id="filterEndDate"
              value={filters.endDate}
              placeholder="Đến ngày"
              onChange={(val) => handleChange("endDate", val)}
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Trạng thái (chiếm 1/3) */}
        <div>
          <Label className="mb-1 block">Trạng thái</Label>
          <Select
            value={filters.status}
            onValueChange={(val) => handleChange("status", val)}
          >
            <SelectTrigger id="filterStatus" className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10"
        >
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
