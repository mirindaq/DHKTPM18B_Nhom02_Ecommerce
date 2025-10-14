import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import type { PromotionFilter } from "@/types/promotion.type";

interface PromotionFilterProps {
  onSearch: (filters: PromotionFilter) => void;
}

export default function PromotionFilter({ onSearch }: PromotionFilterProps) {
  const [filters, setFilters] = useState<PromotionFilter>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onSearch({});
  };

  const handleFilterChange = (key: keyof PromotionFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên chương trình</Label>
              <Input
                id="name"
                placeholder="Nhập tên chương trình..."
                value={filters.name || ""}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại khuyến mãi</Label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="ORDER">Đơn hàng</SelectItem>
                  <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                  <SelectItem value="PRODUCT_VARIANT">Biến thể sản phẩm</SelectItem>
                  <SelectItem value="CATEGORY">Danh mục</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Trạng thái</Label>
              <Select
                value={filters.active?.toString() || ""}
                onValueChange={(value) => 
                  handleFilterChange("active", value === "" ? undefined : value === "true")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
