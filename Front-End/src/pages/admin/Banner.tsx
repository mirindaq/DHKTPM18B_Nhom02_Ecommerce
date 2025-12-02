import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import BannerDialog from "@/components/admin/banners/BannerDialog";
import BannerTable from "@/components/admin/banners/BannerTable";
import BannerFilter from "@/components/admin/banners/BannerFilter";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { bannerService } from "@/services/banner.service";
import type {
  Banner,
  BannerListResponse,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "@/types/banner.type";

export default function Banners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const {
    data: bannersData,
    isLoading: isLoadingBanners,
    refetch: refetchBanners,
  } = useQuery<BannerListResponse>(
    () => bannerService.getBanners(
      currentPage, 
      pageSize, 
      startDate || undefined,
      endDate || undefined,
      isActive === null ? undefined : isActive
    ),
    {
      queryKey: [
        "banners",
        currentPage.toString(),
        pageSize.toString(),
        startDate || "",
        endDate || "",
        isActive?.toString() || "",
      ],
    }
  );

  const pagination = bannersData?.data;
  const banners = bannersData?.data?.data || [];

  // Create banner
  const createBannerMutation = useMutation(
    (data: CreateBannerRequest) => bannerService.createBanner(data),
    {
      onSuccess: () => {
        toast.success("Thêm banner thành công");
        refetchBanners();
        setIsDialogOpen(false);
        setEditingBanner(null);
      },
      onError: (error) => {
        console.error("Error creating banner:", error);
        toast.error("Không thể thêm banner");
      },
    }
  );

  // Update banner
  const updateBannerMutation = useMutation(
    ({ id, data }: { id: number; data: UpdateBannerRequest }) =>
      bannerService.updateBanner(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật banner thành công");
        refetchBanners();
        setIsDialogOpen(false);
        setEditingBanner(null);
      },
      onError: (error) => {
        console.error("Error updating banner:", error);
        toast.error("Không thể cập nhật banner");
      },
    }
  );


  const handleOpenAddDialog = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: CreateBannerRequest | UpdateBannerRequest) => {
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: data as UpdateBannerRequest });
    } else {
      createBannerMutation.mutate(data as CreateBannerRequest);
    }
  };


  const handleToggleStatus = (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      const updateData: UpdateBannerRequest = {
        title: banner.title,
        imageUrl: banner.imageUrl,
        description: banner.description,
        linkUrl: banner.linkUrl,
        isActive: !banner.isActive,
        startDate: banner.startDate.split('T')[0],
        endDate: banner.endDate.split('T')[0],
      };
      updateBannerMutation.mutate({ id, data: updateData });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilter = (params: { startDate?: string; endDate?: string; isActive?: boolean | null }) => {
    setStartDate(params.startDate);
    setEndDate(params.endDate);
    setIsActive(params.isActive ?? null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý banner
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các banner quảng cáo trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm banner
        </Button>
      </div>

      <BannerFilter onSearch={handleFilter} />

      <BannerTable
        banners={banners}
        onEdit={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingBanners}
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

      {/* Dialog */}
      <BannerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        banner={editingBanner}
        onSubmit={handleFormSubmit}
        isLoading={
          createBannerMutation.isLoading || updateBannerMutation.isLoading
        }
      />
    </div>
  );
}
