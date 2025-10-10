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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { PromotionSummary } from "@/types/promotion.type";

interface PromotionTableProps {
  promotions: PromotionSummary[];
  isLoading: boolean;
  onEdit: (promotion: PromotionSummary) => void;
  onDelete: (id: number) => void;
  onViewDetail: (promotion: PromotionSummary) => void;
  onToggleStatus: (id: number) => void;
}

export default function PromotionTable({
  promotions,
  isLoading,
  onEdit,
  onDelete,
  onViewDetail,
  onToggleStatus,
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

  const getTypeLabel = (type: string) => {
    const labels = {
      ORDER: "Đơn hàng",
      PRODUCT: "Sản phẩm",
      PRODUCT_VARIANT: "Biến thể sản phẩm",
      CATEGORY: "Danh mục",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ORDER: "bg-blue-100 text-blue-800",
      PRODUCT: "bg-green-100 text-green-800",
      PRODUCT_VARIANT: "bg-purple-100 text-purple-800",
      CATEGORY: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDiscountText = (promotion: PromotionSummary) => {
    if (promotion.discountType === "PERCENTAGE") {
      return `${promotion.discountValue}%`;
    }
    return `${promotion.discountValue.toLocaleString()}đ`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên chương trình</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Đối tượng</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Độ ưu tiên</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Không có chương trình khuyến mãi nào
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{promotion.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {promotion.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(promotion.type)}>
                    {getTypeLabel(promotion.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-green-600">
                    {getDiscountText(promotion)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">Tất cả</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDate(promotion.startDate)}</div>
                    <div className="text-gray-500">đến {formatDate(promotion.endDate)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={promotion.active ? "default" : "secondary"}>
                    {promotion.active ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {promotion.priority}
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
