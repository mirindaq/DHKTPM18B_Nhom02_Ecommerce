import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { VoucherTable } from "@/components/admin/vouchers";
import VoucherFilter from "@/components/admin/vouchers/VoucherFilter";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { voucherService } from "@/services/voucher.service";
import type { VoucherListResponse, VoucherType } from "@/types/voucher.type";

export default function Vouchers() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // state filter
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    type?: VoucherType;
    active?: boolean;
    startDate?: string;
    endDate?: string;
  }>({});

  // useQuery dựa trên filters
  const {
    data: vouchersData,
    isLoading: isLoadingVouchers,
    refetch: refetchVouchers,
  } = useQuery<VoucherListResponse>(
    () =>
      voucherService.getVouchers(
        currentPage,
        pageSize,
        searchParams.name || "",
        searchParams.type,
        searchParams.active,
        searchParams.startDate,
        searchParams.endDate
      ),
    {
      queryKey: [
        "vouchers",
        currentPage.toString(),
        pageSize.toString(),
        JSON.stringify(searchParams),
      ],
    }
  );

  const vouchers = vouchersData?.data?.data || [];
  const pagination = vouchersData?.data;

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

  // pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // toggle status
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // callback filter
  const handleSearch = (filters: {
    name?: string;
    type?: VoucherType;
    active?: boolean;
    startDate?: string;
    endDate?: string;
  }) => {
    setSearchParams(filters);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getActiveVouchersCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vouchers.filter((voucher) => {
      if (!voucher.active) return false;

      const startDate = new Date(voucher.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(voucher.endDate);
      endDate.setHours(23, 59, 59, 999);

      return today >= startDate && today <= endDate;
    }).length;
  };

  const getInactiveVouchersCount = () => {
    return vouchers.filter((voucher) => !voucher.active).length;
  };

  const getExpiredVouchersCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vouchers.filter((voucher) => {
      if (!voucher.active) return false;

      const endDate = new Date(voucher.endDate);
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
            Quản lý voucher
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý và theo dõi các voucher giảm giá trong hệ thống
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/admin/vouchers/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm voucher
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Tổng voucher</p>
          <p className="text-2xl font-bold text-blue-700">
            {pagination?.totalItem || 0}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-700">
            {getActiveVouchersCount()}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">Hết hạn</p>
          <p className="text-2xl font-bold text-red-700">
            {getExpiredVouchersCount()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Tạm dừng</p>
          <p className="text-2xl font-bold text-gray-700">
            {getInactiveVouchersCount()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <VoucherFilter onSearch={handleSearch} isLoading={isLoadingVouchers} />

      {/* Table */}
      <VoucherTable
        vouchers={vouchers}
        totalItems={pagination?.totalItem || 0}
        onEdit={(voucher) => {
          navigate(`/admin/vouchers/edit/${voucher.id}`);
        }}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingVouchers}
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
    </div>
  );
}
