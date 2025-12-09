import { useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import {
  Home,
  Loader2,
  Newspaper,
  Gamepad2,
  MessageSquare,
  Smartphone,
  Megaphone,
  Users,
} from "lucide-react";
import { articleService } from "@/services/article.service";
import { articleCategoryService } from "@/services/article-category.service";
import { useQuery } from "@/hooks";
import ArticleCard from "@/components/user/ArticleCard";
import type { ArticleListResponse } from "@/types/article.type";
import type {
  ArticleCategoryResponse,
  ArticleCategoryListResponse,
} from "@/types/article-category.type";
import { PUBLIC_PATH } from "@/constants/path";

const getCategoryIcon = (slug: string) => {
  const iconMap: Record<string, any> = {
    "tin-cong-nghe": Newspaper,
    "s-games": Gamepad2,
    "tu-van": MessageSquare,
    "tren-tay": Smartphone,
    "danh-gia": MessageSquare,
    "thu-thuat": MessageSquare,
    "khuyen-mai": Megaphone,
    "tuyen-dung": Users,
  };
  return iconMap[slug] || Newspaper;
};


export default function NewsCategory() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useQuery<ArticleCategoryListResponse>(
    () => articleCategoryService.getCategories(1, 100, ""),
    {
      queryKey: ["article-categories", "category-page"],
    }
  );

  // Fetch category info
  const {
    data: categoryData,
    isLoading: loadingCategory,
    isError: errorCategory,
  } = useQuery<ArticleCategoryResponse>(
    () => articleCategoryService.getCategoryBySlug(slug!),
    {
      queryKey: ["article-category", "by-slug", slug!],
      enabled: !!slug,
    }
  );

  // Fetch articles by category
  const {
    data: articlesData,
    isLoading: loadingArticles,
  } = useQuery<ArticleListResponse>(
    () =>
      articleService.getArticles(
        currentPage,
        10,
        "",
        categoryData?.data?.id ?? null,
        null
      ),
    {
      queryKey: ["articles", "by-category", categoryData?.data?.id?.toString() ?? "", currentPage.toString()],
      enabled: !!categoryData?.data?.id,
    }
  );

  const categories = categoriesData?.data?.data ?? [];
  const category = categoryData?.data;
  const articles = articlesData?.data?.data ?? [];
  const totalPages = articlesData?.data?.totalPage ?? 1;

  const loading = loadingCategories || loadingCategory || loadingArticles;
  const error = errorCategory || (!loading && !category);

  if (loading && !category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <p className="text-red-600 mb-4">
          {error ? "Không thể tải bài viết. Vui lòng thử lại sau." : "Không tìm thấy chuyên mục"}
        </p>
        <button
          onClick={() => navigate(PUBLIC_PATH.HOME)}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="sticky top-28 hidden lg:block h-fit">
            <div className="space-y-1">
              <Link
                to={PUBLIC_PATH.NEWS}
                className={`
                  flex items-center gap-3 px-3 py-2 transition-colors
                  ${
                    location.pathname === PUBLIC_PATH.NEWS
                      ? "text-red-600"
                      : "text-gray-700 hover:text-red-600"
                  }
                `}
              >
                <Home size={20} />
                <span className="font-medium">Trang chủ</span>
              </Link>

              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                const isActive = category?.id === cat.id;
                return (
                  <Link
                    key={cat.id}
                    to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", cat.slug)}`}
                    className={`
                      flex items-center gap-3 px-3 py-2 transition-colors
                      ${
                        isActive
                          ? "text-red-600"
                          : "text-gray-700 hover:text-red-600"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{cat.title}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Category Header */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{category?.title}</h1>
                  <p className="text-sm text-gray-500">Các bài viết trong chuyên mục</p>
                </div>
              </div>
            </section>

            {/* Articles Grid */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              {loadingArticles ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có bài viết nào trong chuyên mục này</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-red-300 transition-all font-medium"
                      >
                        Trước
                      </button>
                      <span className="px-5 py-2.5 bg-red-600 text-white border border-red-600 rounded-lg font-semibold">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-red-300 transition-all font-medium"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

