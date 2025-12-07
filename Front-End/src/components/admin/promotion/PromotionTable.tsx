import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/CustomBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  Search,
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import type { PromotionSummary } from "@/types/promotion.type";

interface PromotionTableProps {
  promotions: PromotionSummary[];
  isLoading: boolean;
  onEdit: (promotion: PromotionSummary) => void;
  onDelete: (id: number) => void;
  onViewDetail: (promotion: PromotionSummary) => void;
  onToggleStatus: (id: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function PromotionTable({
  promotions,
  isLoading,
  onEdit,
  onDelete,
  onViewDetail,
  onToggleStatus,
  currentPage = 1,
  pageSize = 10,
}: PromotionTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      ALL: { label: "Tất cả", icon: Tag, color: "bg-gray-100 text-gray-800 border-gray-200" },
      PRODUCT: { label: "Sản phẩm", icon: Tag, color: "bg-green-100 text-green-800 border-green-200" },
      PRODUCT_VARIANT: { label: "Biến thể", icon: Tag, color: "bg-purple-100 text-purple-800 border-purple-200" },
      CATEGORY: { label: "Danh mục", icon: Tag, color: "bg-orange-100 text-orange-800 border-orange-200" },
      BRAND: { label: "Thương hiệu", icon: Tag, color: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    return configs[type as keyof typeof configs] || configs.ALL;
  };

  const getDiscountText = (promotion: PromotionSummary) => {
    return `${promotion.discount}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPromotionStatus = (promotion: PromotionSummary) => {
    // Nếu active = false → Tạm dừng
    if (!promotion.active) {
      return {
        label: "Tạm dừng",
        icon: XCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      };
    }

    // Nếu active = true, kiểm tra thời gian
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time để so sánh chỉ ngày
    
    const startDate = new Date(promotion.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(promotion.endDate);
    endDate.setHours(23, 59, 59, 999); // Set cuối ngày

    // Chưa bắt đầu
    if (today < startDate) {
      return {
        label: "Chưa bắt đầu",
        icon: Clock,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }

    // Hết hạn
    if (today > endDate) {
      return {
        label: "Hết hạn",
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
      };
    }

    // Đang hoạt động (trong khoảng thời gian)
    return {
      label: "Hoạt động",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
    };
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">STT</TableHead>
            <TableHead className="font-semibold text-gray-700">Tên chương trình</TableHead>
            <TableHead className="font-semibold text-gray-700">Loại</TableHead>
            <TableHead className="font-semibold text-gray-700">Giảm giá</TableHead>
            <TableHead className="font-semibold text-gray-700">Thời gian</TableHead>
            <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
            <TableHead className="font-semibold text-gray-700">Độ ưu tiên</TableHead>
            <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-24 text-gray-500">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      Không có chương trình khuyến mãi nào
                    </p>
                    <p className="text-sm text-gray-400">
                      Các chương trình khuyến mãi sẽ hiển thị tại đây
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promotion, index) => {
              const typeConfig = getTypeConfig(promotion.promotionType);
              const TypeIcon = typeConfig.icon;
              const statusConfig = getPromotionStatus(promotion);
              const StatusIcon = statusConfig.icon;
              
              return (
                <TableRow key={promotion.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">
                          {promotion.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomBadge className={`${typeConfig.color} border`}>
                      <TypeIcon className="mr-1 h-3 w-3" />
                      {typeConfig.label}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      {getDiscountText(promotion)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div>{formatDate(promotion.startDate)}</div>
                      <div className="text-gray-500">đến {formatDate(promotion.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomBadge className={`${statusConfig.color} border`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-700">
                      {promotion.priority}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetail(promotion)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(promotion)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(promotion.id)}>
                          {promotion.active ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Tạm dừng
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(promotion.id)}
                          className="text-red-600"
                          disabled={deletingId === promotion.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === promotion.id ? "Đang xóa..." : "Xóa"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
