import { useState, useEffect } from "react";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import type { ProductQuestionFilters } from "@/types/productQuestion.type";

// Modal Component
function AnswersModal({
  question,
  isOpen,
  onClose,
  onReply,
  onToggleAnswerStatus,
  onDeleteAnswer,
  replyContent,
  setReplyContent,
  isReplying,
  setIsReplying,
}: {
  question: any;
  isOpen: boolean;
  onClose: () => void;
  onReply: (questionId: number) => void;
  onToggleAnswerStatus: (
    questionId: number,
    answerId: number,
    status: boolean
  ) => void;
  onDeleteAnswer: (questionId: number, answerId: number) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 overflow-y-auto">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Phản hồi</h2>
              <p className="text-sm text-gray-600 mt-1">
                Sản phẩm:{" "}
                <span className="font-semibold">{question.productName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Original Question */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {question.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {question.userName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {question.createdAt
                      ? new Date(question.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                  <p className="text-gray-800 mt-2 text-sm">
                    {question.content}
                  </p>
                </div>
              </div>
            </div>

            {/* Answers List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Các phản hồi ({question.answers.length})
              </h3>

              {question.answers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có phản hồi nào
                </p>
              ) : (
                question.answers.map((answer: any) => (
                  <div
                    key={answer.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-xs ${
                            answer.admin
                              ? "bg-gradient-to-br from-purple-400 to-purple-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-600"
                          }`}
                        >
                          {answer.userName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">
                              {answer.userName}
                            </p>
                            {answer.admin && (
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full font-semibold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {answer.createdAt
                              ? new Date(answer.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : ""}
                          </p>
                          <p className="text-gray-800 text-sm mt-2">
                            {answer.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() =>
                            onToggleAnswerStatus(
                              question.id,
                              answer.id,
                              answer.status
                            )
                          }
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title={
                            answer.status ? "Ẩn phản hồi" : "Hiển thị phản hồi"
                          }
                        >
                          {answer.status ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteAnswer(question.id, answer.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Xóa phản hồi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <div className="border-t border-gray-200 pt-4">
              {!isReplying ? (
                <button
                  onClick={() => setIsReplying(true)}
                  className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Thêm phản hồi
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phản hồi từ Admin
                    </label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReply(question.id)}
                      disabled={!replyContent.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Gửi
                    </button>
                    <button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                      className="px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductQuestionsPage() {
  const {
    questions,
    loading,
    pagination,
    fetchQuestions,
    toggleQuestionStatus,
    deleteQuestion,
    addAnswer,
    toggleAnswerStatus,
    deleteAnswer,
  } = useProductQuestions();

  const [filters, setFilters] = useState<ProductQuestionFilters>({
    page: 1,
    size: 10,
    status: "all",
    search: "",
  });

  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchQuestions(filters);
  }, [filters, fetchQuestions]);

  // Cập nhật selectedQuestion khi questions thay đổi
  useEffect(() => {
    if (selectedQuestion && isModalOpen) {
      const updated = questions.find((q) => q.id === selectedQuestion.id);
      if (updated) {
        setSelectedQuestion(updated);
      }
    }
  }, [questions, isModalOpen]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: boolean | "all") => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = (question: any) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleReply = async (questionId: number) => {
    if (!replyContent.trim()) return;

    const success = await addAnswer({
      content: replyContent,
      productQuestionId: questionId,
    });

    if (success) {
      setReplyContent("");
      setIsReplying(false);
      // Hook đã update state questions, useEffect sẽ tự động update selectedQuestion
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      await deleteQuestion(id);
    }
  };

  const handleDeleteAnswer = async (questionId: number, answerId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      await deleteAnswer(questionId, answerId);
      // Hook đã update state questions, useEffect sẽ tự động update selectedQuestion
    }
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Bình luận
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các bình luận và phản hồi của khách hàng
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung hoặc tên sản phẩm..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => handleStatusFilter("all")}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                filters.status === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleStatusFilter(true)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filters.status === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Hiển thị
            </button>
            <button
              onClick={() => handleStatusFilter(false)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filters.status === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Đã ẩn
            </button>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="text-sm text-gray-600">
          Tổng: <span className="font-semibold">{pagination.totalItems}</span>{" "}
          bình luận
        </div>
      </div>

      {/* Questions Table-like List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Không có bình luận nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {question.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {question.userName}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {question.createdAt
                            ? new Date(question.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Product Info with Image */}
                    <div className="flex items-start gap-2 mb-2">
                      {question.productImage && (
                        <img
                          src={question.productImage}
                          alt={question.productName}
                          className="w-12 h-12 rounded object-cover flex-shrink-0 border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          Sản phẩm:{" "}
                          <span className="font-semibold text-gray-900">
                            {question.productName}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-800 text-sm line-clamp-2">
                      {question.content}
                    </p>
                  </div>

                  {/* Right Info */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        question.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {question.status ? "✓ Hiển thị" : "✕ Đã ẩn"}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      {question.answers.length} phản hồi
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => handleOpenModal(question)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Phản hồi
                  </button>

                  <button
                    onClick={() =>
                      toggleQuestionStatus(question.id, question.status)
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    {question.status ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Ẩn
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Hiển thị
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            ← Trước
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.currentPage) <= 1
            )
            .map((page, index, array) => (
              <div key={`page-${page}`}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => handlePageChange(page)}
                  className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
                    pagination.currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </div>
            ))}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Answers Modal */}
      {selectedQuestion && (
        <AnswersModal
          question={selectedQuestion}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onReply={handleReply}
          onToggleAnswerStatus={toggleAnswerStatus}
          onDeleteAnswer={handleDeleteAnswer}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          isReplying={isReplying}
          setIsReplying={setIsReplying}
        />
      )}
    </div>
  );
}
