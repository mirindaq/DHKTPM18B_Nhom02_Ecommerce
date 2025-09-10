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

export default function CustomerFilter({
  onSearch,
}: {
  onSearch: (params: any) => void;
}) {
  const [filters, setFilters] = useState({
    name: "",
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
      name: "",
      email: "",
      phone: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    onSearch({
      name: "",
      email: "",
      phone: "",
      status: null,
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <h2 className="font-semibold text-gray-700 text-lg mb-4">Bộ lọc tìm kiếm</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name, Email, Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Tên khách hàng", field: "name", placeholder: "Nhập tên..." },
            { label: "Email", field: "email", placeholder: "Nhập email..." },
            { label: "Số điện thoại", field: "phone", placeholder: "Nhập số điện thoại..." },
          ].map((item) => (
            <div key={item.field} className="space-y-1">
              <Label htmlFor={`filter-${item.field}`} className="text-sm text-gray-600">
                {item.label}
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id={`filter-${item.field}`}
                  placeholder={item.placeholder}
                  value={(filters as any)[item.field]}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Date range + Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-sm text-gray-600">Ngày tham gia</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
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
              <SelectTrigger id="filterStatus" className="mt-1">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center px-4"
          >
            <X className="h-4 w-4 mr-1" /> Xóa bộ lọc
          </Button>
          <Button type="submit" className="flex items-center px-6 bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-1" /> Tìm kiếm
          </Button>
        </div>
      </form>
    </div>
  );
}
