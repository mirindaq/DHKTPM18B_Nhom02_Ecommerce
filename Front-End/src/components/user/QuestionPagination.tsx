import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";

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
  if (currentPage >= totalPages) return null;

  const remainingItems = totalItems - currentItems;

  return (
    <div className="flex items-center justify-center mt-6">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all rounded-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải...
          </>
        ) : (
          <>
            Xem thêm {remainingItems} câu hỏi
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
