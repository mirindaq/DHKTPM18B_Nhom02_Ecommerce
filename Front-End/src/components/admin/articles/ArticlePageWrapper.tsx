import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { articleService } from "@/services/article.service";
import { articleCategoryService } from "@/services/article-category.service";
import { useQuery, useMutation } from "@/hooks";
import  ArticleForm  from "@/components/admin/articles/ArticleForm"; 
import type { CreateArticleRequest, Article } from "@/types/article.type";
import type { ArticleCategory } from "@/types/article-category.type";


interface ArticlePageWrapperProps {
  mode: "add" | "edit";
  title: string;
  description: string;
  successMessage: string;
  errorMessage: string;
  submitButtonText: string;
}

export default function ArticlePageWrapper({
  mode,
  title,
  description,
  successMessage,
  errorMessage,
  
}: ArticlePageWrapperProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0");

  // 1. Fetch Article Categories (Cần cho Select trong form)
  const { data: categoriesData } = useQuery(
    () => articleCategoryService.getCategories(1, 999, ""),
    { queryKey: ["article-categories", "all"] }
  );
  const categories: ArticleCategory[] = categoriesData?.data?.data || [];

  // 2. Get article by ID (chỉ cho edit mode)
  const {
    data: articleData,
    isLoading: isLoadingArticle,
    error: articleError
  } = useQuery(
    () => articleService.getArticleById(articleId), // Giả định có service này
    {
      queryKey: ["article", articleId.toString()],
      enabled: mode === "edit" && !!articleId
    }
  );

  const article: Article | undefined = articleData?.data;

  // 3. Mutations
  const createMutation = useMutation(
    (data: CreateArticleRequest) => articleService.createArticle(data),
    {
      onSuccess: () => {
        toast.success(successMessage);
        navigate("/admin/articles");
      },
      onError: (error) => {
        console.error("Error creating article:", error);
        toast.error(errorMessage);
      }
    }
  );

  const updateMutation = useMutation(
    (data: CreateArticleRequest) => articleService.updateArticle(articleId, data),
    {
      onSuccess: () => {
        toast.success(successMessage);
        navigate("/admin/articles");
      },
      onError: (error) => {
        console.error("Error updating article:", error);
        toast.error(errorMessage);
      }
    }
  );

  // 4. Handlers
  const handleFormSubmit = (data: CreateArticleRequest) => {
    console.log("Payload gửi lên:", data); 

    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    navigate("/admin/articles");
  };

  // 5. Loading/Error States
  if (mode === "edit" && isLoadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải thông tin bài viết...</span>
      </div>
    );
  }

  if (mode === "edit" && (articleError || !article)) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="outline" size="sm" onClick={handleCancel} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-600 mb-4">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={handleCancel}>Quay lại danh sách bài viết</Button>
        </div>
      </div>
    );
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // 6. Render
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-base text-gray-600">
            {mode === "edit" && article ? (
              <>
                {description}: <span className="font-medium">{article.title}</span>
              </>
            ) : (
              description
            )}
          </p>
        </div>
      </div>

      {/* <div className="max-w-4xl mx-auto"> */}
        {/* Truyền categories vào form */}
        <ArticleForm
          article={mode === "edit" ? article : undefined}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      {/* </div> */}
    </div>
  );
}