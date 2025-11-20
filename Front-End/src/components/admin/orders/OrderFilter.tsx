import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { OrderStatus } from "@/types/order.type";

interface OrderFilterProps {
  onSearch: (filters: {
    customerName?: string;
    orderDate?: string;
    customerPhone?: string;
    status?: OrderStatus;
    isPickup?: boolean;
  }) => void;
  isLoading?: boolean;
}

const orderStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "READY_FOR_PICKUP", label: "Sẵn sàng lấy hàng" },
  { value: "DELIVERING", label: "Đang giao hàng" },
  { value: "SHIPPED", label: "Chuẩn bị giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "PAYMENT_FAILED", label: "Thanh toán thất bại" }
];

export default function OrderFilter({ onSearch, isLoading }: OrderFilterProps) {
  const [customerName, setCustomerName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [isPickup, setIsPickup] = useState<string>("all");

  const handleSearch = () => {
    const filters: any = {};
    
    if (customerName.trim()) filters.customerName = customerName.trim();
    if (orderDate) filters.orderDate = orderDate;
    if (customerPhone.trim()) filters.customerPhone = customerPhone.trim();
    if (status && status !== "all") filters.status = status;
    if (isPickup !== "all") filters.isPickup = isPickup === "true";

    onSearch(filters);
  };

  const handleReset = () => {
    setCustomerName("");
    setOrderDate("");
    setCustomerPhone("");
    setStatus("all");
    setIsPickup("all");
    onSearch({});
  };

  const hasActiveFilters = customerName || orderDate || customerPhone || (status !== "all") || (isPickup !== "all");

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tên người mua</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập tên..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Order Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ngày đặt hàng</label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
            <Input
              placeholder="Nhập SĐT..."
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus | "all")}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Is Pickup */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Loại nhận hàng</label>
            <Select value={isPickup} onValueChange={setIsPickup}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Nhận tại quầy</SelectItem>
                <SelectItem value="false">Giao hàng</SelectItem>
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

