import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { articleService } from "@/services/article.service";
import { articleCategoryService } from "@/services/article-category.service";
import { ArticleTable } from "@/components/admin/articles";
import { useNavigate } from "react-router";
import type {
  ArticleListResponse,
} from "@/types/article.type";
import type { ArticleCategory } from "@/types/article-category.type";
import ArticleFilter from "@/components/admin/articles/ArticleFilter";

export default function Articles() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize,] = useState(7);
  const [filters, setFilters] = useState<any>({});


  const { data: categoriesData } = useQuery(
    () => articleCategoryService.getCategories(1, 10000, ""),
    { queryKey: ["article-categories", "all"] }
  );

  const categories: ArticleCategory[] = categoriesData?.data?.data || [];

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<ArticleListResponse>(
    () => {
      console.log("📡 Calling API with:", {
        page,
        pageSize,
        title: filters.title || "",
        status: filters.status ?? null,
        categoryId: filters.categoryId ?? null,
        createdDate: filters.createdDate || null
      });
      return articleService.getArticlesForAdmin(
        page,
        pageSize,
        filters.title || "",
        filters.status ?? null,
        filters.categoryId ?? null,
        filters.createdDate || null
      );
    },
    {
      queryKey: [
        "articles",
        page.toString(),
        pageSize.toString(),
        JSON.stringify(filters),
      ],
    }
  );

  const pagination = data?.data;
  const articles = data?.data?.data || [];

  const handleOpenAdd = () => {
    navigate("/admin/articles/add");
  };

  const handleOpenEdit = (a: any) => {
    navigate(`/admin/articles/edit/${a.id}`);
  };

  const toggleStatusMutation = useMutation(
    (id: number) => articleService.changeStatusArticle(id),
    {
      onSuccess: () => {
        toast.success('Thay đổi trạng thái thành công');
        refetch();
      },
      onError: (error) => {
        console.error('Error toggling article status:', error);
        toast.error('Không thể thay đổi trạng thái bài viết');
      }
    }
  );

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const categoryMap = useMemo(() => {
    const m: Record<number, string> = {};
    categories.forEach((c) => (m[c.id] = c.title));
    return m;
  }, [categories]);

  const handleSearch = (newFilters: any) => {
    setPage(1); 
    setFilters(newFilters); 
  };



  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý tin tức</h1>
          <p className="text-lg text-gray-600">
            Quản lý các bái viết trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm bài viết
        </Button>
      </div>

      <ArticleFilter onSearch={handleSearch} />
      <ArticleTable
        articles={articles.map((a: any) => ({ ...a, articleCategoryTitle: categoryMap[a.articleCategoryId] || "" }))}
        onEdit={(a) => handleOpenEdit(a)}
        onToggleStatus={handleToggleStatus}
        currentPage={page}
        pageSize={pageSize}
        isLoading={isLoading}
      />

      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={pagination.totalPage} onPageChange={setPage} />
        </div>
      )}


    </div>
  );
}