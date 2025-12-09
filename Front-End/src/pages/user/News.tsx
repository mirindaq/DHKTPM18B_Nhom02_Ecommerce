import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Clock,
  ChevronRight,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return (
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }) + ` ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
  );
};

export default function News() {
  const [showAllArticles, setShowAllArticles] = useState(false);
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

  // Fetch featured articles
  const {
    data: featuredData,
    isLoading: loadingFeatured,
  } = useQuery<ArticleListResponse>(
    () => articleService.getArticles(1, 4, "", null, null),
    {
      queryKey: ["articles", "featured"],
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
  const featuredArticles = featuredData?.data?.data ?? [];
  const allLatestArticles = latestData?.data?.data ?? [];
  const moreArticles = allLatestArticles.slice(4);
  const displayedArticles = showAllArticles
    ? moreArticles
    : moreArticles.slice(0, 8);

  const loading = loadingCategories || loadingFeatured || loadingLatest;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        </div>
      </div>
    );
  }

  const mainFeatured = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="sticky top-4 hidden lg:block h-fit">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Button
                  asChild
                  variant="ghost"
                  className={`
                    w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                    transition-all duration-200 ease-in-out
                    ${
                      location.pathname === PUBLIC_PATH.NEWS
                        ? "!bg-red-50 !text-red-600 !border-l-4 !border-red-600 hover:!bg-red-100 hover:!text-red-700"
                        : "!text-gray-700 !border-l-4 !border-transparent hover:!bg-gray-100 hover:!text-gray-900 hover:!border-l-4 hover:!border-red-300"
                    }
                  `}
                >
                  <Link to={PUBLIC_PATH.NEWS}>
                    <Home size={22} />
                    <span>Trang chủ</span>
                  </Link>
                </Button>

                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.slug);
                  const isActive = location.pathname.includes(
                    `${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`
                  );
                  return (
                    <Button
                      key={category.id}
                      asChild
                      variant="ghost"
                      className={`
                        w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                        transition-all duration-200 ease-in-out
                        ${
                          isActive
                            ? "!bg-red-50 !text-red-600 !border-l-4 !border-red-600 hover:!bg-red-100 hover:!text-red-700"
                            : "!text-gray-700 !border-l-4 !border-transparent hover:!bg-gray-100 hover:!text-gray-900 hover:!border-l-4 hover:!border-red-300"
                        }
                      `}
                    >
                      <Link to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`}>
                        <Icon size={22} />
                        <span>{category.title}</span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-10 md:space-y-12">
            {/* CHỦ ĐỀ HOT */}
            <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Chủ đề hot
                  </h2>
                  <p className="text-sm text-gray-500">Khám phá các chủ đề nổi bật</p>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                {categories.slice(0, 7).map((category, index) => {
                  const colorIndex = index % 7;
                  const gradientClasses = [
                    "bg-gradient-to-br from-gray-900 to-gray-700",
                    "bg-gradient-to-br from-orange-600 to-yellow-500",
                    "bg-gradient-to-br from-blue-600 to-cyan-400",
                    "bg-gradient-to-br from-pink-600 to-rose-700",
                    "bg-gradient-to-br from-cyan-500 to-blue-600",
                    "bg-gradient-to-br from-indigo-600 to-purple-700",
                    "bg-gradient-to-br from-green-600 to-emerald-500",
                  ][colorIndex];

                  return (
                    <Link
                      key={category.id}
                      to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", category.slug)}`}
                      className="flex-shrink-0 w-36 h-36 md:w-40 md:h-40 relative rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full ${gradientClasses} ${
                          category.image ? "hidden" : ""
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="text-white text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">
                          {category.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* NỘI BẬT NHẤT */}
            {mainFeatured && (
              <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Nổi bật nhất
                    </h2>
                    <p className="text-sm text-gray-500">Những bài viết được quan tâm nhất</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Featured Article - Large */}
                  <Link
                    to={`${PUBLIC_PATH.NEWS_DETAIL.replace(":slug", mainFeatured.slug)}`}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-red-200 flex flex-col h-full"
                  >
                    <div className="relative overflow-hidden bg-gray-100 aspect-[16/9]">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                          {mainFeatured.category.title}
                        </span>
                      </div>
                      <img
                        src={mainFeatured.thumbnail}
                        alt={mainFeatured.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/800x450/e5e7eb/6b7280?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 mb-4 leading-tight">
                        {mainFeatured.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {mainFeatured.staffName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{mainFeatured.staffName}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Clock size={12} />
                              <span>{formatDate(mainFeatured.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Latest Articles - Right Side */}
                  <div className="space-y-4 md:space-y-5">
                    {sideArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`${PUBLIC_PATH.NEWS_DETAIL.replace(":slug", article.slug)}`}
                        className="flex gap-4 bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 p-4 md:p-5 border border-gray-100 hover:border-red-200"
                      >
                        <div className="relative w-32 md:w-40 h-24 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-bold">
                              {article.category.title}
                            </span>
                          </div>
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 mb-3 leading-tight">
                            {article.title}
                          </h3>
                          <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {article.staffName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-600">{article.staffName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{formatDate(article.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* XEM NHIỀU TUẦN QUA */}
            {moreArticles.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Xem nhiều tuần qua
                      </h2>
                      <p className="text-sm text-gray-500">Các bài viết được đọc nhiều nhất</p>
                    </div>
                  </div>
                  {moreArticles.length > 8 && (
                    <button
                      onClick={() => setShowAllArticles(!showAllArticles)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {showAllArticles ? "Thu gọn" : "Xem thêm"}
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          showAllArticles ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {displayedArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`${PUBLIC_PATH.NEWS_DETAIL.replace(":slug", article.slug)}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-red-200 flex flex-col h-full"
                    >
                      <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                          }}
                        />
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                            {article.category.title}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-4 md:p-5 flex-grow flex flex-col">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 mb-3 leading-tight">
                          {article.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {article.staffName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-600">{article.staffName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

