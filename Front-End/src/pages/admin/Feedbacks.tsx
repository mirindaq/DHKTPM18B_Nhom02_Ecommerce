import { useState } from "react";
import { toast } from "sonner";
import { FeedbackTable } from "@/components/admin/feedbacks";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { feedbackService } from "@/services/feedback.service";
import type {
  FeedbackListResponse,
  FeedbackFilters,
} from "@/types/feedback.type";

export default function Feedbacks() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(10);
  const [filters, setFilters] = useState<FeedbackFilters>({});

  const {
    data: feedbacksData,
    isLoading: isLoadingFeedbacks,
    refetch: refetchFeedbacks,
  } = useQuery<FeedbackListResponse>(
    () => feedbackService.getAllFeedbacks(currentPage, pageSize, filters),
    {
      queryKey: [
        "feedbacks",
        currentPage.toString(),
        pageSize.toString(),
        JSON.stringify(filters),
      ],
    }
  );

  const feedbacks = feedbacksData?.data?.content || [];
  const totalPages = feedbacksData?.data?.totalPages || 1;

  // Toggle feedback status
  const toggleStatusMutation = useMutation(
    (id: number) => feedbackService.changeStatusFeedback(id),
    {
      onSuccess: () => {
        toast.success("Thay đổi trạng thái thành công");
        refetchFeedbacks();
      },
      onError: (error) => {
        console.error("Error toggling feedback status:", error);
        toast.error("Không thể thay đổi trạng thái đánh giá");
      },
    }
  );

  // Delete feedback
  const deleteFeedbackMutation = useMutation(
    (id: number) => feedbackService.deleteFeedback(id),
    {
      onSuccess: () => {
        toast.success("Xóa đánh giá thành công");
        refetchFeedbacks();
      },
      onError: (error) => {
        console.error("Error deleting feedback:", error);
        toast.error("Không thể xóa đánh giá");
      },
    }
  );

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteFeedbackMutation.mutate(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: FeedbackFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý đánh giá
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các đánh giá của khách hàng trong hệ thống
          </p>
        </div>
      </div>

      <FeedbackTable
        feedbacks={feedbacks}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingFeedbacks}
        isTogglingStatus={toggleStatusMutation.isLoading}
        onFilterChange={handleFilterChange}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
