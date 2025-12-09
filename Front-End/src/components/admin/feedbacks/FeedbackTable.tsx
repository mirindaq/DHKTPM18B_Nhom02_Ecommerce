import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
  Power,
  PowerOff,
  Trash2,
  Loader2,
  Star,
  X,
} from "lucide-react";
import type { Feedback, FeedbackFilters } from "@/types/feedback.type";

interface FeedbackTableProps {
  feedbacks: Feedback[];
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
  isTogglingStatus?: boolean;
  onFilterChange: (filters: FeedbackFilters) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function FeedbackTable({
  feedbacks,
  onDelete,
  onToggleStatus,
  onFilterChange,
  isLoading,
  isTogglingStatus,
  currentPage = 1,
  pageSize = 10,
}: FeedbackTableProps) {
  const [filters, setFilters] = useState<FeedbackFilters>({});

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const handleFilterChange = (key: keyof FeedbackFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">
          ({rating})
        </span>
      </div>
    );
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Bộ lọc</h3>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-xs">
                {filters.fromDate && (
                  <CustomBadge
                    variant="info"
                    size="sm"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Từ: {new Date(filters.fromDate).toLocaleDateString("vi-VN")}
                  </CustomBadge>
                )}
                {filters.toDate && (
                  <CustomBadge
                    variant="info"
                    size="sm"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Đến: {new Date(filters.toDate).toLocaleDateString("vi-VN")}
                  </CustomBadge>
                )}
                {filters.rating && (
                  <CustomBadge
                    variant="info"
                    size="sm"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {filters.rating} sao
                  </CustomBadge>
                )}
                {filters.status !== undefined && filters.status !== null && (
                  <CustomBadge
                    variant="success"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {filters.status ? "Hiển thị" : "Ẩn"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* From Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Từ ngày</label>
            <DatePicker
              value={filters.fromDate}
              onChange={(value) => handleFilterChange("fromDate", value)}
              placeholder="Chọn từ ngày"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Đến ngày
            </label>
            <DatePicker
              value={filters.toDate}
              onChange={(value) => handleFilterChange("toDate", value)}
              placeholder="Chọn đến ngày"
            />
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Số sao</label>
            <Select
              value={filters.rating?.toString() || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "rating",
                  value === "all" ? undefined : parseInt(value)
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
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
                filters.status === true
                  ? "true"
                  : filters.status === false
                  ? "false"
                  : "all"
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "status",
                  value === "all" ? undefined : value === "true"
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hiển thị</SelectItem>
                <SelectItem value="false">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 invisible">
              Action
            </label>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Tổng cộng:{" "}
          <span className="font-semibold text-gray-900">
            {feedbacks.length}
          </span>{" "}
          đánh giá
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Khách hàng
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Sản phẩm
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Đánh giá
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Bình luận
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Ngày tạo
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-24 text-gray-500"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {hasActiveFilters
                          ? "Không tìm thấy đánh giá nào"
                          : "Chưa có đánh giá nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {hasActiveFilters
                          ? "Thử điều chỉnh bộ lọc"
                          : "Chưa có khách hàng nào đánh giá"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback, index) => (
                <TableRow
                  key={feedback.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {feedback.customerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {feedback.productImage && (
                        <img
                          src={feedback.productImage}
                          alt={feedback.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span
                        className="text-gray-700 max-w-xs truncate"
                        title={feedback.productName}
                      >
                        {feedback.productName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{renderRating(feedback.rating)}</TableCell>
                  <TableCell
                    className="text-gray-600 max-w-md truncate"
                    title={feedback.comment}
                  >
                    {feedback.comment || "Không có bình luận"}
                  </TableCell>
                  <TableCell>
                    <CustomBadge
                      variant={
                        feedback.status === false ? "secondary" : "success"
                      }
                      className={
                        feedback.status === false
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {feedback.status === false ? "Ẩn" : "Hiển thị"}
                    </CustomBadge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(feedback.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(feedback.id)}
                        className={`${
                          feedback.status === false
                            ? "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                            : "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        }`}
                        disabled={isLoading || isTogglingStatus}
                      >
                        {isTogglingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : feedback.status === false ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(feedback.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={isLoading}
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
