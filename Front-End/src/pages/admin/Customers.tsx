import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@/hooks";
import Pagination from "@/components/ui/pagination";
import { customerService } from "@/services/customer.service";
import type {
  CustomerSummary,
  CreateCustomerRequest,
  UpdateCustomerProfileRequest,
  CustomerListResponse,
} from "@/types/customer.type";
import CustomerTable from "@/components/admin/customer/CustomerTable";
import CustomerDialog from "@/components/admin/customer/CustomerDialog";
import CustomerDetailDialog from "@/components/admin/customer/CustomerDetailDialog";
import CustomerFilter from "@/components/admin/customer/CustomerFilter";
import ExcelActions from "@/components/admin/common/ExcelActions";

export default function Customers() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerSummary | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);

  // state filter giống StaffFilter
  const [filters, setFilters] = useState<any>({});

  // useQuery dựa trên filters
  const { data: customersData, isLoading: isLoadingCustomers, refetch: refetchCustomers } =
    useQuery<CustomerListResponse>(
      () => customerService.getCustomers({ page: currentPage, size: pageSize, ...filters }),
      {
        queryKey: ["customers", currentPage.toString(), pageSize.toString(), filters],
      }
    );

  const customers = customersData?.data?.data || [];
  const pagination = customersData?.data;

  // success callback chung
  const onSuccess = (message: string) => {
        toast.success(message);
        // ❌ LOẠI BỎ refetchCustomers() khỏi hàm chung này
        // refetchCustomers(); 
        setIsAddEditDialogOpen(false);
        setEditingCustomer(null);
      };

  // mutations
  const createCustomerMutation = useMutation(
    (data: CreateCustomerRequest) => customerService.createCustomer(data),
    {
      onSuccess: () => onSuccess("Thêm khách hàng thành công"),
      onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể thêm"),
    }
  );

  const updateCustomerMutation = useMutation(
    ({ id, data }: { id: number; data: UpdateCustomerProfileRequest }) =>
      customerService.updateCustomer(id, data),
    {
      onSuccess: () => onSuccess("Cập nhật thành công"),
      onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể cập nhật"),
    }
  );

  const deleteCustomerMutation = useMutation((id: number) => customerService.deleteCustomer(id), {
    onSuccess: () => onSuccess("Xóa thành công"),
    onError: (e: any) => toast.error(e?.response?.data?.message || "Không thể xóa"),
  });

  const toggleStatusMutation = useMutation((id: number) => customerService.changeStatusCustomer(id), {
        onSuccess: () => {
          toast.success("Thay đổi trạng thái thành công");
          
          // ✅ ĐẢM BẢO CHỈ GỌI HÀM refetch Ở ĐÂY (VÀ KHÔNG CÓ AWAIT/ASYNC)
          refetchCustomers(); 
        },
        onError: (error) => {
          console.error("Error toggling customer status:", error);
          toast.error("Không thể thay đổi trạng thái khách hàng");
        },
      });
  

  // form submit
  const handleFormSubmit = async (data: CreateCustomerRequest | UpdateCustomerProfileRequest) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: data as UpdateCustomerProfileRequest });
    } else {
      createCustomerMutation.mutate(data as CreateCustomerRequest);
    }
  };

  // pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFormFinished = () => {
        toast.success(editingCustomer ? "Cập nhật thành công" : "Thêm khách hàng thành công");
        refetchCustomers();
        setIsAddEditDialogOpen(false);
        setEditingCustomer(null);
      };
  // toggle status
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // callback filter giống StaffFilter
  const handleSearch = (newFilters: any) => {
    setCurrentPage(1); // reset về trang 1
    setFilters(newFilters); // gửi nguyên payload lên API
  };

  return (
    <div className="space-y-3 p-2">
       
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          <p className="text-lg text-gray-600">Quản lý và theo dõi thông tin khách hàng.</p>
        </div>
        <div className="flex gap-2">
          <ExcelActions
            onDownloadTemplate={customerService.downloadTemplate}
            onImport={customerService.importCustomers}
            onExport={customerService.exportCustomers}
            onImportSuccess={refetchCustomers}
            templateFileName="customer_template.xlsx"
            exportFileName="customers.xlsx"
          />
          <Button
            size="lg"
            onClick={() => {
              setEditingCustomer(null);
              setIsAddEditDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Filter */}
      <CustomerFilter onSearch={handleSearch} />

      {/* Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoadingCustomers}
        onEdit={(customer) => {
          setEditingCustomer(customer);
          setIsAddEditDialogOpen(true);
        }}
        onDelete={(id) => deleteCustomerMutation.mutate(id)}
        onViewDetail={(customer) => {
          setViewingCustomer(customer);
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
      <CustomerDialog
        open={isAddEditDialogOpen}
        onOpenChange={(open) => {
          setIsAddEditDialogOpen(open);
        }}
        customer={editingCustomer}
        onSubmit={handleFormSubmit}
        onFinished={handleFormFinished}
        isLoading={createCustomerMutation.isLoading || updateCustomerMutation.isLoading}
      />
     
      <CustomerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        customer={viewingCustomer}
      />
    </div>
  );
}
