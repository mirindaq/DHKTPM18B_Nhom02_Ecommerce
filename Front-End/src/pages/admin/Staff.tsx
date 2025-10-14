import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import StaffDialog from "@/components/admin/staffs/StaffDialog";
import StaffTable from "@/components/admin/staffs/StaffTable";
import StaffFilter from "@/components/admin/staffs/StaffFilter";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { staffService } from "@/services/staff.service";
import type {
  Staff as StaffType,
  StaffListPayload,
  CreateStaffRequest,
  UpdateStaffRequest,
  UserRole,
} from "@/types/staff.type";

export default function Staffs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [filters, setFilters] = useState<any>({});
  const [roles, setRoles] = useState<UserRole[]>([]);

  // fetch staff list
  const {
    data: staffsData,
    isLoading: isLoadingStaffs,
    refetch: refetchStaffs,
  } = useQuery<StaffListPayload>(
    () => staffService.getStaffs(currentPage, pageSize, filters),
    {
      queryKey: [
        "staffs",
        currentPage.toString(),
        pageSize.toString(),
        filters,
      ],
    }
  );

  const pagination = staffsData || undefined;
  const staffs = staffsData?.data || [];

  // fetch roles once
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const r = await staffService.getRolesForAdmin();
        setRoles(r || []);
      } catch (err) {
        console.error("Error loading roles", err);
      }
    };
    fetchRoles();
  }, []);

  // mutations (create, update, toggle)
  const createStaffMutation = useMutation(
    (data: CreateStaffRequest) => staffService.createStaff(data),
    {
      onSuccess: () => {
        toast.success("Thêm nhân viên thành công");
        refetchStaffs();
        setIsDialogOpen(false);
        setEditingStaff(null);
      },
      onError: () => toast.error("Không thể thêm nhân viên"),
    }
  );

  const updateStaffMutation = useMutation(
    ({ id, data }: { id: number; data: UpdateStaffRequest }) =>
      staffService.updateStaff(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật nhân viên thành công");
        refetchStaffs();
        setIsDialogOpen(false);
        setEditingStaff(null);
      },
      onError: () => toast.error("Không thể cập nhật nhân viên"),
    }
  );

  const toggleActiveMutation = useMutation(
    (id: number) => staffService.changeActive(id),
    {
      onSuccess: () => {
        toast.success("Thay đổi trạng thái thành công");
        refetchStaffs();
      },
      onError: () => toast.error("Không thể thay đổi trạng thái"),
    }
  );

  // dialog
  const handleOpenAddDialog = () => {
    setEditingStaff(null);
    setIsDialogOpen(true);
  };
  const handleOpenEditDialog = (staff: StaffType) => {
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // setEditingStaff(null);
  };
  const handleFormSubmit = (data: CreateStaffRequest | UpdateStaffRequest) => {
    if (editingStaff) {
      updateStaffMutation.mutate({
        id: editingStaff.id,
        data: data as UpdateStaffRequest,
      });
    } else {
      createStaffMutation.mutate(data as CreateStaffRequest);
    }
  };

  // toggle active
  const handleToggleActive = (id: number) => {
    toggleActiveMutation.mutate(id);
  };

  // pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // search
  const handleSearch = (newFilters: any) => {
    setCurrentPage(1); // reset về trang 1 khi search
    setFilters(newFilters);
  };

  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý nhân viên
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các nhân viên trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Bộ lọc */}
      <StaffFilter onSearch={handleSearch} />

      {/* Bảng */}
      <StaffTable
        staffs={staffs}
        onEdit={handleOpenEditDialog}
        onDelete={undefined}
        onToggleStatus={handleToggleActive}
        isLoading={isLoadingStaffs}
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

      {/* Dialog thêm/sửa */}
      <StaffDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        staff={editingStaff}
        roles={roles}
        onSubmit={handleFormSubmit}
        isLoading={
          createStaffMutation.isLoading || updateStaffMutation.isLoading
        }
        isEdit={!!editingStaff}
      />
    </div>
  );
}
