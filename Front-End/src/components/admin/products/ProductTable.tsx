import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomBadge } from "@/components/ui/CustomBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Image as ImageIcon,
  Package,
  X,
  Eye,
} from "lucide-react";
import type { Product, ProductFilters } from "@/types/product.type";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onViewDetail: (product: Product) => void;
  isLoading?: boolean;
  onFilterChange: (filters: ProductFilters) => void;
  currentPage?: number;
  pageSize?: number;
  brands?: Brand[];
  categories?: Category[];
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetail,
  onFilterChange,
  isLoading,
  currentPage = 1,
  pageSize = 7,
  brands = [],
  categories = [],
}: ProductTableProps) {
  const [filters, setFilters] = useState<ProductFilters>({});

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" || value === "" ? null : value,
    }));
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== undefined && value !== ""
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Bộ lọc</h3>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-xs">
                {filters.keyword && (
                  <CustomBadge
                    variant="info"
                    size="sm"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Từ khóa: {filters.keyword}
                  </CustomBadge>
                )}
                {filters.brandId && (
                  <CustomBadge
                    variant="info"
                    size="sm"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    Thương hiệu:{" "}
                    {brands.find((b) => b.id === filters.brandId)?.name}
                  </CustomBadge>
                )}
                {filters.categoryId && (
                  <CustomBadge
                    variant="success"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Danh mục:{" "}
                    {categories.find((c) => c.id === filters.categoryId)?.name}
                  </CustomBadge>
                )}
                {filters.status !== undefined && filters.status !== null && (
                  <CustomBadge
                    variant="warning"
                    size="sm"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {filters.status ? "Hoạt động" : "Tạm dừng"}
                  </CustomBadge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <CustomBadge
                    variant="error"
                    size="sm"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Giá:{" "}
                    {filters.minPrice ? formatPrice(filters.minPrice) : "0"} -{" "}
                    {filters.maxPrice ? formatPrice(filters.maxPrice) : "∞"}
                  </CustomBadge>
                )}
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearFilters}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {/* Keyword */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Từ khóa</label>
            <Input
              placeholder="Tên hoặc SPU..."
              value={filters.keyword || ""}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              disabled={isLoading}
              className="h-9"
            />
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Thương hiệu
            </label>
            <Select
              value={filters.brandId?.toString() || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "brandId",
                  value === "all" ? null : parseInt(value)
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Danh mục
            </label>
            <Select
              value={filters.categoryId?.toString() || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "categoryId",
                  value === "all" ? null : parseInt(value)
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Trạng thái
            </label>
            <Select
              value={
                filters.status === null || filters.status === undefined
                  ? "all"
                  : filters.status.toString()
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "status",
                  value === "all" ? null : value === "true"
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Giá từ</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minPrice",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              disabled={isLoading}
              className="h-9"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Giá đến</label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxPrice",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              disabled={isLoading}
              className="h-9"
            />
          </div>

          {/* Search Button */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 invisible">Tìm</label>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full h-9"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <div className="text-sm text-gray-600">
            Tổng cộng:{" "}
            <span className="font-semibold text-gray-900">
              {products.length}
            </span>{" "}
            sản phẩm
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Hình ảnh
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tên sản phẩm
              </TableHead>
              <TableHead className="font-semibold text-gray-700">SPU</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Giá thấp nhất
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Giá cao nhất
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    <p className="text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-24 text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {hasActiveFilters
                          ? "Không tìm thấy sản phẩm nào"
                          : "Chưa có sản phẩm nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {hasActiveFilters
                          ? "Thử tìm kiếm với bộ lọc khác"
                          : "Hãy thêm sản phẩm đầu tiên"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="font-semibold text-gray-900 max-w-xs truncate"
                    title={product.name}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.spu}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          <p className="font-medium text-green-600">
                            {formatPrice(
                              Math.min(...product.variants.map((v) => v.price))
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có giá</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          <p className="font-medium text-blue-600">
                            {formatPrice(
                              Math.max(...product.variants.map((v) => v.price))
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có giá</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomBadge
                      variant={product.status ? "success" : "secondary"}
                      className={
                        product.status
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {product.status ? "Hoạt động" : "Tạm dừng"}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(product)}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                        disabled={isLoading}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        disabled={isLoading}
                        title="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(product.id)}
                        className={`${
                          product.status
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }`}
                        disabled={isLoading}
                        title={product.status ? "Tạm dừng" : "Kích hoạt"}
                      >
                        {product.status ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={isLoading}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
