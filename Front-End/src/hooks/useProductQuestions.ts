import { useState, useCallback } from "react";
import { productQuestionService, productQuestionAdminService } from "@/services/productQuestion.service";
import { toast } from "sonner";
import type {
  ProductQuestionWithProduct,
  ProductQuestionFilters,
  ProductQuestionAnswerAddRequest,
} from "@/types/productQuestion.type";

export function useProductQuestions() {
  const [questions, setQuestions] = useState<ProductQuestionWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  const fetchQuestions = useCallback(async (filters?: ProductQuestionFilters) => {
    try {
      setLoading(true);
      const response = await productQuestionAdminService.getAllProductQuestions(filters);
      setQuestions(response.data.data);
      setPagination({
        currentPage: response.data.page,
        totalPages: response.data.totalPage,
        totalItems: response.data.totalItem,
        pageSize: response.data.limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching product questions:", error);
      toast.error("Không thể tải danh sách bình luận");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleQuestionStatus = useCallback(
    async (id: number, currentStatus: boolean) => {
      try {
        await productQuestionAdminService.updateProductQuestionStatus(id, {
          status: !currentStatus,
        });
        
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: !currentStatus } : q))
        );
        
        toast.success(
          currentStatus ? "Đã ẩn bình luận" : "Đã hiển thị bình luận"
        );
        return true;
      } catch (error) {
        console.error("Error toggling question status:", error);
        toast.error("Không thể cập nhật trạng thái");
        return false;
      }
    },
    []
  );

  const deleteQuestion = useCallback(async (id: number) => {
    try {
      await productQuestionAdminService.deleteProductQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Đã xóa bình luận");
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Không thể xóa bình luận");
      return false;
    }
  }, []);

  const addAnswer = useCallback(
  async (data: ProductQuestionAnswerAddRequest) => {
    try {
      await productQuestionService.createProductQuestionAnswer(data);

      // Reload lại danh sách để tránh trùng data
      await fetchQuestions();

      toast.success("Đã thêm phản hồi");
      return true;
    } catch (error) {
      console.error("Error adding answer:", error);
      toast.error("Không thể thêm phản hồi");
      return false;
    }
  },
  [fetchQuestions]
);


  const toggleAnswerStatus = useCallback(
    async (questionId: number, answerId: number, currentStatus: boolean) => {
      try {
        await productQuestionAdminService.updateProductQuestionAnswerStatus(answerId, {
          status: !currentStatus,
        });
        
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: q.answers.map((a) =>
                    a.id === answerId ? { ...a, status: !currentStatus } : a
                  ),
                }
              : q
          )
        );
        
        toast.success(
          currentStatus ? "Đã ẩn phản hồi" : "Đã hiển thị phản hồi"
        );
        return true;
      } catch (error) {
        console.error("Error toggling answer status:", error);
        toast.error("Không thể cập nhật trạng thái");
        return false;
      }
    },
    []
  );

  const deleteAnswer = useCallback(
    async (questionId: number, answerId: number) => {
      try {
        await productQuestionAdminService.deleteProductQuestionAnswer(answerId);
        
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
              : q
          )
        );
        
        toast.success("Đã xóa phản hồi");
        return true;
      } catch (error) {
        console.error("Error deleting answer:", error);
        toast.error("Không thể xóa phản hồi");
        return false;
      }
    },
    []
  );

  return {
    questions,
    loading,
    pagination,
    fetchQuestions,
    toggleQuestionStatus,
    deleteQuestion,
    addAnswer,
    toggleAnswerStatus,
    deleteAnswer,
  };
}
