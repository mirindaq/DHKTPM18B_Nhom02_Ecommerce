import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@/hooks";
import { useNavigate } from "react-router";
import Pagination from "@/components/ui/pagination";
import { promotionService } from "@/services/promotion.service";
import type {
  PromotionSummary,
  PromotionListResponse,
} from "@/types/promotion.type";
import PromotionTable from "@/components/admin/promotion/PromotionTable";
import PromotionDetailDialog from "@/components/admin/promotion/PromotionDetailDialog";
import PromotionFilter from "@/components/admin/promotion/PromotionFilter";
import { ADMIN_PATH } from "@/constants/path";

export default function Promotions() {
  const navigate = useNavigate();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingPromotion, setViewingPromotion] = useState<PromotionSummary | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);

  // state filter
  const [filters, setFilters] = useState<any>({});

  // useQuery dựa trên filters
  const { data: promotionsData, isLoading: isLoadingPromotions, refetch: refetchPromotions } =
    useQuery<PromotionListResponse>(
      () => promotionService.getPromotions({ page: currentPage, size: pageSize, ...filters }),
      {
        queryKey: ["promotions", currentPage.toString(), pageSize.toString(), JSON.stringify(filters)],
      }
    );

  const promotions = promotionsData?.data?.data || [];
  const pagination = promotionsData?.data;

  const deletePromotionMutation = useMutation((id: number) => promotionService.deletePromotion(id), {
    onSuccess: () => {
      toast.success("Xóa thành công");
      refetchPromotions();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể xóa"),
  });

  const toggleStatusMutation = useMutation((id: number) => promotionService.changeStatusPromotion(id), {
    onSuccess: () => {
      toast.success("Thay đổi trạng thái thành công");
      refetchPromotions();
    },
    onError: (error) => {
      console.error("Error toggling promotion status:", error);
      toast.error("Không thể thay đổi trạng thái chương trình khuyến mãi");
    },
  });

  // pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // toggle status
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // callback filter
  const handleSearch = (newFilters: any) => {
    setCurrentPage(1); // reset về trang 1
    setFilters(newFilters); // gửi nguyên payload lên API
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Quản lý chương trình khuyến mãi</h1>
          <p className="text-lg text-gray-600">Quản lý và theo dõi các chương trình khuyến mãi.</p>
        </div>
        <Button
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => navigate(ADMIN_PATH.PROMOTION_ADD)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm chương trình khuyến mãi
        </Button>
      </div>

      {/* Filter */}
      <PromotionFilter onSearch={handleSearch} />

      {/* Table */}
      <PromotionTable
        promotions={promotions}
        isLoading={isLoadingPromotions}
        onEdit={(promotion) => {
          navigate(`/admin/promotions/edit/${promotion.id}`);
        }}
        onDelete={(id) => deletePromotionMutation.mutate(id)}
        onViewDetail={(promotion) => {
          setViewingPromotion(promotion);
          setIsDetailDialogOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={pagination.totalPage} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Dialogs */}
      <PromotionDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        promotion={viewingPromotion}
      />
    </div>
  );
}
