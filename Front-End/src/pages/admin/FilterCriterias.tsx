import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import FilterCriteriaDialog from "@/components/admin/filter-criteria/FilterCriteriaDialog";
import FilterValuesDialog from "@/components/admin/filter-criteria/FilterValuesDialog";
import FilterCriteriaTable from "@/components/admin/filter-criteria/FilterCriteriaTable";
import { useQuery, useMutation } from "@/hooks";
import { filterCriteriaService } from "@/services/filterCriteria.service";
import { categoryService } from "@/services/category.service";
import type {
  FilterCriteria,
  CreateFilterCriteriaRequest,
} from "@/types/filterCriteria.type";
import type { Category } from "@/types/category.type";

export default function FilterCriterias() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isValuesDialogOpen, setIsValuesDialogOpen] = useState(false);
  const [editingFilterCriteria, setEditingFilterCriteria] = useState<FilterCriteria | null>(null);
  const [selectedFilterCriteria, setSelectedFilterCriteria] = useState<FilterCriteria | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categoriesData } = useQuery(
    () => categoryService.getAllCategoriesSimple(),
    { queryKey: ["categories-simple"] }
  );

  const categories = categoriesData?.data?.data || [];

  const {
    data: filterCriteriasData,
    isLoading: isLoadingFilterCriterias,
    refetch: refetchFilterCriterias,
  } = useQuery(
    () => {
      if (!selectedCategoryId) {
        return Promise.resolve({ status: 200, message: "", data: [] });
      }
      return filterCriteriaService.getFilterCriteriaByCategory(selectedCategoryId, searchTerm || "");
    },
    {
      queryKey: [
        "filter-criterias",
        selectedCategoryId?.toString() || "",
        searchTerm || "",
      ],
      enabled: !!selectedCategoryId,
    }
  );

  const filterCriterias = filterCriteriasData?.data || [];

  // Create filter criteria
  const createFilterCriteriaMutation = useMutation(
    (data: CreateFilterCriteriaRequest) => filterCriteriaService.createFilterCriteria(data),
    {
      onSuccess: () => {
        toast.success("Thêm tiêu chí lọc thành công");
        refetchFilterCriterias();
        setIsDialogOpen(false);
        setEditingFilterCriteria(null);
      },
      onError: (error) => {
        console.error("Error creating filter criteria:", error);
        toast.error("Không thể thêm tiêu chí lọc");
      },
    }
  );

  // Delete filter criteria
  const deleteFilterCriteriaMutation = useMutation(
    (id: number) => filterCriteriaService.deleteFilterCriteria(id),
    {
      onSuccess: () => {
        toast.success("Xóa tiêu chí lọc thành công");
        refetchFilterCriterias();
      },
      onError: (error) => {
        console.error("Error deleting filter criteria:", error);
        toast.error("Không thể xóa tiêu chí lọc");
      },
    }
  );

  const handleOpenAddDialog = () => {
    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn danh mục trước");
      return;
    }
    setEditingFilterCriteria(null);
    setIsDialogOpen(true);
  };


  const handleOpenSetValuesDialog = (filterCriteria: FilterCriteria) => {
    setSelectedFilterCriteria(filterCriteria);
    setIsValuesDialogOpen(true);
  };

  const handleFormSubmit = (data: CreateFilterCriteriaRequest) => {
    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    createFilterCriteriaMutation.mutate({
      ...data,
      categoryId: selectedCategoryId,
    });
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tiêu chí lọc này?")) {
      deleteFilterCriteriaMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý tiêu chí lọc
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các tiêu chí lọc sản phẩm theo danh mục
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
          disabled={!selectedCategoryId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm tiêu chí lọc
        </Button>
      </div>

      {/* Category Selector */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn danh mục <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCategoryId || ""}
          onChange={(e) => handleCategoryChange(Number(e.target.value))}
          className="w-full max-w-md h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((category: Category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {selectedCategoryId && (
          <p className="mt-2 text-sm text-gray-600">
            Đang hiển thị tiêu chí lọc cho danh mục:{" "}
            <span className="font-semibold">
              {categories.find((c: Category) => c.id === selectedCategoryId)?.name}
            </span>
          </p>
        )}
      </div>

      {/* Table */}
      {selectedCategoryId ? (
        <>
          <FilterCriteriaTable
            filterCriterias={filterCriterias}
            onSetValues={handleOpenSetValuesDialog}
            onDelete={handleDelete}
            isLoading={isLoadingFilterCriterias}
            onSearch={handleSearch}
            currentPage={currentPage}
            pageSize={pageSize}
            selectedCategoryId={selectedCategoryId}
          />

        </>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">
            Vui lòng chọn danh mục để xem và quản lý tiêu chí lọc
          </p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <FilterCriteriaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        filterCriteria={editingFilterCriteria}
        categoryId={selectedCategoryId}
        onSubmit={handleFormSubmit}
        isLoading={createFilterCriteriaMutation.isLoading}
      />

      {/* Set Values Dialog */}
      <FilterValuesDialog
        open={isValuesDialogOpen}
        onOpenChange={setIsValuesDialogOpen}
        filterCriteria={selectedFilterCriteria}
        onSuccess={refetchFilterCriterias}
      />
    </div>
  );
}

