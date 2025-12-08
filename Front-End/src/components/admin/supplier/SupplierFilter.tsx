import { useState, useRef } from "react";
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
import { Search, X, Download, Upload, FileDown, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { supplierService } from "@/services/supplier.service";

export default function SupplierFilter({
  onSearch,
  onReload,
}: {
  onSearch: (params: any) => void;
  onReload?: () => void;
}) {
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    address: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
    };
    onSearch(payload);
  };

  const handleClearFilters = () => {
    const resetState = {
      name: "",
      phone: "",
      address: "",
      status: "",
      startDate: "",
      endDate: "",
    };
    setFilters(resetState);
    onSearch({ ...resetState, status: null });
  };

  // --- 1. Xử lý Download Template ---
  const handleDownloadTemplate = async () => {
    try {
      setIsProcessing(true);
      const response = await supplierService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // SỬA LỖI Ở ĐÂY: đổi "href" thành "a"
      const link = document.createElement("a");
      
      link.href = url;
      link.setAttribute("download", "supplier_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải mẫu thành công!");
    } catch (error) {
      toast.error("Lỗi tải mẫu template");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. Xử lý Export Excel ---
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const response = await supplierService.exportSuppliers();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // SỬA LỖI Ở ĐÂY: đổi "href" thành "a"
      const link = document.createElement("a");
      
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `suppliers_export_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      toast.error("Lỗi xuất dữ liệu");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. Xử lý Import Excel ---
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await supplierService.importSuppliers(formData);
      
      if (res) {
        toast.success("Import dữ liệu thành công!");
        if (onReload) onReload();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi khi import file";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700 text-base">
            Bộ lọc & Công cụ
          </h2>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={isProcessing}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
              Mẫu
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerImport}
              disabled={isProcessing}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Import
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isProcessing}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
              Export
            </Button>
          </div>
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
          <div className="space-y-1 md:col-span-2">
            <Label className="text-sm text-gray-600">Ngày tạo</Label>
            <div className="flex items-center gap-4">
              <DatePicker
                value={filters.startDate}
                placeholder="Từ ngày"
                onChange={(val) => handleChange("startDate", val)}
                className="w-full"
              />
              <DatePicker
                value={filters.endDate}
                placeholder="Đến ngày"
                onChange={(val) => handleChange("endDate", val)}
                className="w-full"
              />
            </div>
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