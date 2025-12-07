import { useState } from "react";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, ChevronUp, Clock, Send, ChevronDown } from "lucide-react";
import type { ProductQuestion, ProductQuestionAnswer } from "@/types/productQuestion.type";

interface QuestionItemProps {
  question: ProductQuestion;
  onAnswerSubmit?: (questionId: number, content: string) => void;
  isAnswering?: boolean;
}

export default function QuestionItem({ question, onAnswerSubmit, isAnswering = false }: QuestionItemProps) {
  const [expandedAnswers, setExpandedAnswers] = useState(question.answers && question.answers.length > 0);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState("");

  // Helper function to get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    return `${diffInMonths} tháng trước`;
  };

  // Toggle answer visibility
  const toggleAnswers = () => {
    setExpandedAnswers(!expandedAnswers);
  };

  // Handle answer form submission
  const handleAnswerSubmit = () => {
    if (!answerContent.trim() || !onAnswerSubmit) return;

    onAnswerSubmit(question.id, answerContent.trim());
    setAnswerContent("");
    setShowAnswerForm(false);
  };

  // Toggle answer form
  const toggleAnswerForm = () => {
    setShowAnswerForm(!showAnswerForm);
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-purple-600 text-white font-semibold text-sm">
            {getUserInitials(question.userName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Question Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 text-sm">{question.userName}</span>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                {question.createdAt ? formatTimeAgo(question.createdAt) : ""}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3">{question.content}</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Reply Button - only show if there are answers */}
            {question.answers && question.answers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAnswers}
                className="h-auto p-0 text-red-600 hover:text-red-700 hover:bg-transparent font-medium text-sm"
              >
                {expandedAnswers ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Thu gọn phản hồi
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Chi tiết phản hồi
                  </>
                )}
              </Button>
            )}

            {/* Answer Button - only allow replying to original question */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAnswerForm}
              className="h-auto p-0 text-red-600 hover:text-red-700 hover:bg-transparent font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Phản hồi
            </Button>
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-sm">Trả lời câu hỏi</h4>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Viết câu trả lời của bạn tại đây..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!answerContent.trim() || isAnswering}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isAnswering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi phản hồi
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAnswerForm(false);
                      setAnswerContent("");
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Answers Section */}
          {question.answers && question.answers.length > 0 && expandedAnswers && (
            <div className="mt-4 space-y-4">
              {question.answers.map((answer: ProductQuestionAnswer) => (
                <div key={answer.id} className="flex items-start gap-4 pl-4 border-l-2 border-gray-100">
                  {/* Answer Avatar - Admin or User */}
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className={answer.admin ? "bg-red-600 text-white font-bold text-xs" : "bg-purple-600 text-white font-semibold text-sm"}>
                      {answer.admin ? "S" : getUserInitials(answer.userName || "U")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Answer Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {answer.admin ? "Quản Trị Viên" : (answer.userName || "Người dùng")}
                      </span>
                      {answer.admin && (
                        <CustomBadge
                          variant="error"
                          size="sm"
                          className="h-5"
                        >
                          QTV
                        </CustomBadge>
                      )}
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {answer.createdAt ? formatTimeAgo(answer.createdAt) : ""}
                        </span>
                      </div>
                    </div>

                    {/* Answer Content with clickable links */}
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {answer.content.split('\n').map((line, idx) => {
                        // Check if line contains a URL
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = line.split(urlRegex);

                        return (
                          <p key={idx} className="mb-1">
                            {parts.map((part, partIdx) => {
                              if (part.match(urlRegex)) {
                                return (
                                  <a
                                    key={partIdx}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline break-all"
                                  >
                                    {part}
                                  </a>
                                );
                              }
                              return <span key={partIdx}>{part}</span>;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

