import { Link, useLocation } from "react-router";
import {
  Home,
  Newspaper,
  Gamepad2,
  MessageSquare,
  Smartphone,
  Megaphone,
  Users,
  Loader2,
} from "lucide-react";
import { articleService } from "@/services/article.service";
import { articleCategoryService } from "@/services/article-category.service";
import { useQuery } from "@/hooks";
import ArticleCard from "@/components/user/ArticleCard";
import type { ArticleListResponse } from "@/types/article.type";
import type { ArticleCategoryListResponse } from "@/types/article-category.type";
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


export default function News() {
  const location = useLocation();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useQuery<ArticleCategoryListResponse>(
    () => articleCategoryService.getCategories(1, 20, ""),
    {
      queryKey: ["article-categories", "news"],
    }
  );

  // Fetch latest articles
  const {
    data: latestData,
    isLoading: loadingLatest,
  } = useQuery<ArticleListResponse>(
    () => articleService.getArticles(1, 20, "", null, null),
    {
      queryKey: ["articles", "latest"],
    }
  );

  const categories = categoriesData?.data?.data ?? [];
  const allLatestArticles = latestData?.data?.data ?? [];

  const loading = loadingCategories || loadingLatest;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        </div>
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

              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                const isActive = location.pathname.includes(
                  `${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`
                );
                return (
                  <Link
                    key={category.id}
                    to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`}
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
                    <span className="font-medium">{category.title}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* CHỦ ĐỀ HOT */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Chủ đề hot
                  </h2>
                  <p className="text-sm text-gray-500">Khám phá các chủ đề nổi bật</p>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.slice(0, 7).map((category) => {
                  const Icon = getCategoryIcon(category.slug);
                  const hasImage = category.image && category.image.trim() !== '';
                  return (
                    <Link
                      key={category.id}
                      to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`}
                      className="flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 min-w-[100px] group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                        {hasImage ? (
                          <img
                            src={category.image}
                            alt={category.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {!hasImage && (
                          <div className="w-full h-full bg-red-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">
                        {category.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* TẤT CẢ BÀI VIẾT */}
            <section className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Tất cả bài viết
                  </h2>
                  <p className="text-sm text-gray-500">Các bài viết mới nhất</p>
                </div>
              </div>

              {loadingLatest ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
              ) : allLatestArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {allLatestArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có bài viết nào</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

