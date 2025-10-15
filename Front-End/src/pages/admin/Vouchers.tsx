import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { VoucherTable } from "@/components/admin/vouchers";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { voucherService } from "@/services/voucher.service";
import type {
  Voucher,
  VoucherListResponse,
} from "@/types/voucher.type";

export default function Vouchers() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    type?: string;
    active?: boolean;
    startDate?: Date;
    endDate?: Date;
  }>({});

  const {
    data: vouchersData,
    isLoading: isLoadingVouchers,
    refetch: refetchVouchers,
  } = useQuery<VoucherListResponse>(
    () => voucherService.getVouchers(
      currentPage,
      pageSize,
      searchTerm,
      filters.type,
      filters.active,
      filters.startDate?.toISOString().split('T')[0],
      filters.endDate?.toISOString().split('T')[0]
    ),
    {
      queryKey: [
        "vouchers",
        currentPage.toString(),
        pageSize.toString(),
        searchTerm,
        filters.type || "",
        filters.active?.toString() || "",
        filters.startDate?.toISOString() || "",
        filters.endDate?.toISOString() || "",
      ],
    }
  );

  const pagination = vouchersData?.data;
  const vouchers = vouchersData?.data?.data || [];

  // Toggle voucher status
  const toggleStatusMutation = useMutation(
    (id: number) => voucherService.changeStatusVoucher(id),
    {
      onSuccess: () => {
        toast.success("Thay đổi trạng thái thành công");
        refetchVouchers();
      },
      onError: (error) => {
        console.error("Error toggling voucher status:", error);
        toast.error("Không thể thay đổi trạng thái voucher");
      },
    }
  );


  const handleCreateVoucher = () => {
    navigate("/admin/vouchers/create");
  };



  const handleEditVoucher = (voucher: Voucher) => {
    navigate(`/admin/vouchers/edit/${voucher.id}`);
  };


  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters: {
    type?: string;
    active?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý voucher
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các voucher giảm giá trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleCreateVoucher}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm voucher
        </Button>
      </div>

      <VoucherTable
        vouchers={vouchers}
        totalItems={pagination?.totalItem || 0}
        onEdit={handleEditVoucher}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingVouchers}
        onSearch={handleSearch}
        onFilter={handleFilter}
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

    </div>
  );
}
