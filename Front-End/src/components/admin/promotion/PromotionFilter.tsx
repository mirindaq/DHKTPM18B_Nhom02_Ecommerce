import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, X, Filter } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PromotionType } from "@/types/promotion.type";

interface PromotionFilterProps {
  onSearch: (filters: {
    name?: string;
    type?: PromotionType;
    active?: boolean;
    startDate?: string;
    priority?: number;
  }) => void;
  isLoading?: boolean;
}

const promotionTypeOptions: { value: PromotionType; label: string }[] = [
  { value: "ALL", label: "Tất cả sản phẩm" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "PRODUCT_VARIANT", label: "Biến thể sản phẩm" },
  { value: "CATEGORY", label: "Danh mục" },
  { value: "BRAND", label: "Thương hiệu" },
];

const priorityOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

export default function PromotionFilter({ onSearch, isLoading }: PromotionFilterProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionType | "all">("all");
  const [active, setActive] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [priority, setPriority] = useState<string>("all");

  const handleSearch = () => {
    const filters: any = {};
    
    if (name.trim()) filters.name = name.trim();
    if (type && type !== "all") filters.type = type;
    if (active !== "all") filters.active = active === "true";
    if (startDate) filters.startDate = startDate;
    if (priority !== "all") filters.priority = parseInt(priority);

    onSearch(filters);
  };

  const handleReset = () => {
    setName("");
    setType("all");
    setActive("all");
    setStartDate("");
    setPriority("all");
    onSearch({});
  };

  const hasActiveFilters = name || (type !== "all") || (active !== "all") || startDate || (priority !== "all");

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
            <label className="text-sm font-medium text-gray-700">Tên chương trình</label>
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

          {/* Type (Loại/Đối tượng) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Loại khuyến mãi</label>
            <Select value={type} onValueChange={(value) => setType(value as PromotionType | "all")}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {promotionTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
            <DatePicker
              value={startDate}
              onChange={(value) => setStartDate(value)}
              placeholder="Chọn ngày bắt đầu"
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

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Độ ưu tiên</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
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
