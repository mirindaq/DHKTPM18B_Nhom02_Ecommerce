import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, X } from "lucide-react";
import type { PurchaseOrderFilter } from "@/types/purchase-order.type";

interface PurchaseOrderFilterProps {
  onSearch: (filters: PurchaseOrderFilter) => void;
  isLoading: boolean;
}

export default function PurchaseOrderFilterComponent({
  onSearch,
  isLoading,
}: PurchaseOrderFilterProps) {
  const [supplierName, setSupplierName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    const filters: PurchaseOrderFilter = {};
    if (supplierName) filters.supplierName = supplierName;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    onSearch(filters);
  };

  const handleReset = () => {
    setSupplierName("");
    setStartDate("");
    setEndDate("");
    onSearch({});
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Tên nhà cung cấp
          </label>
          <Input
            placeholder="Tìm theo tên nhà cung cấp"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Từ ngày</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Đến ngày</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
