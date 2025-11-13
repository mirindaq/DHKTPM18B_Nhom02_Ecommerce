import { useState } from "react";
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

export default function BannerFilter({
  onSearch,
}: {
  onSearch: (params: { startDate?: string; endDate?: string; isActive?: boolean | null }) => void;
}) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    isActive: "",
  });

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      isActive: filters.isActive === "all" || filters.isActive === "" 
        ? null 
        : filters.isActive === "true" 
        ? true 
        : false,
    };
    onSearch(payload);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      isActive: "",
    });
    onSearch({
      startDate: undefined,
      endDate: undefined,
      isActive: null,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <h2 className="font-semibold text-gray-700 text-base mb-4">Bộ lọc tìm kiếm</h2>
        
        {/* Row: Date and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-sm text-gray-600">Khoảng thời gian</Label>
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
            <Label htmlFor="filterStatus" className="text-sm text-gray-600">
              Trạng thái
            </Label>
            <Select
              value={filters.isActive}
              onValueChange={(val) => handleChange("isActive", val)}
            >
              <SelectTrigger id="filterStatus" className="w-full">
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

