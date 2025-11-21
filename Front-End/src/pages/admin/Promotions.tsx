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
  PromotionFilter,
} from "@/types/promotion.type";
import PromotionTable from "@/components/admin/promotion/PromotionTable";
import PromotionDetailDialog from "@/components/admin/promotion/PromotionDetailDialog";
import PromotionFilterComponent from "@/components/admin/promotion/PromotionFilter";
import { ADMIN_PATH } from "@/constants/path";

export default function Promotions() {
  const navigate = useNavigate();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingPromotion, setViewingPromotion] = useState<PromotionSummary | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // state filter
  const [searchParams, setSearchParams] = useState<PromotionFilter>({});

  // useQuery dựa trên filters
  const { data: promotionsData, isLoading: isLoadingPromotions, refetch: refetchPromotions } =
    useQuery<PromotionListResponse>(
      () => promotionService.getPromotions({ 
        page: currentPage, 
        size: pageSize, 
        ...searchParams 
      }),
      {
        queryKey: [
          "promotions", 
          currentPage.toString(), 
          pageSize.toString(), 
          JSON.stringify(searchParams)
        ],
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
  const handleSearch = (filters: PromotionFilter) => {
    setSearchParams(filters);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getActivePromotionsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return promotions.filter((promotion) => {
      if (!promotion.active) return false;
      
      const startDate = new Date(promotion.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(promotion.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      return today >= startDate && today <= endDate;
    }).length;
  };

  const getInactivePromotionsCount = () => {
    return promotions.filter((promotion) => !promotion.active).length;
  };

  const getExpiredPromotionsCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return promotions.filter((promotion) => {
      if (!promotion.active) return false;
      
      const endDate = new Date(promotion.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      return today > endDate;
    }).length;
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý chương trình khuyến mãi
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý và theo dõi các chương trình khuyến mãi trong hệ thống
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate(ADMIN_PATH.PROMOTION_ADD)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chương trình khuyến mãi
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Tổng chương trình</p>
          <p className="text-2xl font-bold text-blue-700">
            {pagination?.totalItem || 0}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-700">
            {getActivePromotionsCount()}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">Hết hạn</p>
          <p className="text-2xl font-bold text-red-700">
            {getExpiredPromotionsCount()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Tạm dừng</p>
          <p className="text-2xl font-bold text-gray-700">
            {getInactivePromotionsCount()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <PromotionFilterComponent onSearch={handleSearch} isLoading={isLoadingPromotions} />

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
        currentPage={currentPage}
        pageSize={pageSize}
      />

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={pagination.totalPage} 
            onPageChange={handlePageChange} 
          />
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
