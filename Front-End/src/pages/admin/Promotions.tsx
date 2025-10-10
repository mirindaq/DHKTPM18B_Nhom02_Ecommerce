import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@/hooks";
import Pagination from "@/components/ui/pagination";
import { promotionService } from "@/services/promotion.service";
import type {
  PromotionSummary,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionListResponse,
} from "@/types/promotion.type";
import PromotionTable from "@/components/admin/promotion/PromotionTable";
import PromotionDialog from "@/components/admin/promotion/PromotionDialog";
import PromotionDetailDialog from "@/components/admin/promotion/PromotionDetailDialog";
import PromotionFilter from "@/components/admin/promotion/PromotionFilter";

export default function Promotions() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionSummary | null>(null);
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
        queryKey: ["promotions", currentPage.toString(), pageSize.toString(), filters],
      }
    );

  const promotions = promotionsData?.data?.data || [];
  const pagination = promotionsData?.data;

  // success callback chung
  const onSuccess = (message: string) => {
    toast.success(message);
    refetchPromotions();
    setIsAddEditDialogOpen(false);
    setEditingPromotion(null);
  };

  // mutations
  const createPromotionMutation = useMutation(
    (data: CreatePromotionRequest) => promotionService.createPromotion(data),
    {
      onSuccess: () => onSuccess("Thêm chương trình khuyến mãi thành công"),
      onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể thêm"),
    }
  );

  const updatePromotionMutation = useMutation(
    ({ id, data }: { id: number; data: UpdatePromotionRequest }) =>
      promotionService.updatePromotion(id, data),
    {
      onSuccess: () => onSuccess("Cập nhật thành công"),
      onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể cập nhật"),
    }
  );

  const deletePromotionMutation = useMutation((id: number) => promotionService.deletePromotion(id), {
    onSuccess: () => onSuccess("Xóa thành công"),
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

  // form submit
  const handleFormSubmit = (data: CreatePromotionRequest | UpdatePromotionRequest) => {
    if (editingPromotion) {
      updatePromotionMutation.mutate({ id: editingPromotion.id, data: data as UpdatePromotionRequest });
    } else {
      createPromotionMutation.mutate(data as CreatePromotionRequest);
    }
  };

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
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => {
            setEditingPromotion(null);
            setIsAddEditDialogOpen(true);
          }}
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
          setEditingPromotion(promotion);
          setIsAddEditDialogOpen(true);
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
      <PromotionDialog
        open={isAddEditDialogOpen}
        onOpenChange={(open) => {
          setIsAddEditDialogOpen(open);
        }}
        promotion={editingPromotion}
        onSubmit={handleFormSubmit}
        isLoading={createPromotionMutation.isLoading || updatePromotionMutation.isLoading}
      />
     
      <PromotionDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        promotion={viewingPromotion}
      />
    </div>
  );
}
