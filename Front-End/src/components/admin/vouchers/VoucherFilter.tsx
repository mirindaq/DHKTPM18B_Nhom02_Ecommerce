import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, X, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { VoucherType } from "@/types/voucher.type";

interface VoucherFilterProps {
  onSearch: (filters: {
    name?: string;
    type?: VoucherType;
    active?: boolean;
    startDate?: string;
    endDate?: string;
  }) => void;
  isLoading?: boolean;
}

const voucherTypeOptions: { value: VoucherType; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "GROUP", label: "Nhóm khách hàng" },
  { value: "RANK", label: "Rank" },
];

export default function VoucherFilter({ onSearch, isLoading }: VoucherFilterProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<VoucherType | "all">("all");
  const [active, setActive] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    const filters: any = {};
    
    if (name.trim()) filters.name = name.trim();
    if (type && type !== "all") filters.type = type;
    if (active !== "all") filters.active = active === "true";
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    onSearch(filters);
  };

  const handleReset = () => {
    setName("");
    setType("all");
    setActive("all");
    setStartDate("");
    setEndDate("");
    onSearch({});
  };

  const hasActiveFilters = name || (type !== "all") || (active !== "all") || startDate || endDate;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tên voucher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập tên..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Loại voucher</label>
            <Select value={type} onValueChange={(value) => setType(value as VoucherType | "all")}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {voucherTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
            <DatePicker
              value={startDate}
              onChange={(value) => setStartDate(value)}
              placeholder="Chọn ngày bắt đầu"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
            <DatePicker
              value={endDate}
              onChange={(value) => setEndDate(value)}
              placeholder="Chọn ngày kết thúc"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

