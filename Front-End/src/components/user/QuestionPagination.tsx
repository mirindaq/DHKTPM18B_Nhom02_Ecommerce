import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface QuestionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentItems: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

export default function QuestionPagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  currentItems,
  onLoadMore,
  isLoading = false
}: QuestionPaginationProps) {
  // Không hiển thị nút nếu đã hết câu hỏi
  if (currentPage >= totalPages) return null;

  const remainingItems = totalItems - currentItems;

  return (
    <div className="flex items-center justify-center mt-6">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all rounded-full"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            Đang tải...
          </>
        ) : (
          <>
            Xem thêm {remainingItems} bình luận
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}

