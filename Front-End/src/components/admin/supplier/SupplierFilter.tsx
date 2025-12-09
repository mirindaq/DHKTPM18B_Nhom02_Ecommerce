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

export default function SupplierFilter({
  onSearch,
}: {
  onSearch: (params: any) => void;
}) {
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    address: "",
    status: "",
  });


  const handleChange = (field: string, value: string | undefined | null) => {
    setFilters({ ...filters, [field]: value || "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...filters,
      status: filters.status === "all" ? null : filters.status,
      name: filters.name || null,
      phone: filters.phone || null,
      address: filters.address || null,
    };
    onSearch(payload);
  };

  const handleClearFilters = () => {
    const resetState = {
      name: "",
      phone: "",
      address: "",
      status: "",
    };
    setFilters(resetState);
    onSearch({ ...resetState, status: null });
  };


  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700 text-base">
            Bộ lọc
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Tên nhà cung cấp</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập tên..."
                value={filters.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Số điện thoại</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập SĐT..."
                value={filters.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Địa chỉ</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập địa chỉ..."
                value={filters.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Trạng thái</Label>
            <Select
              value={filters.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className="w-full">
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

        <div className="flex justify-end gap-2 pt-2 border-t mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="px-4"
          >
            <X className="h-4 w-4 mr-1" /> Xóa bộ lọc
          </Button>
          <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-1" /> Tìm kiếm
          </Button>
        </div>
      </form>
    </div>
  );
}