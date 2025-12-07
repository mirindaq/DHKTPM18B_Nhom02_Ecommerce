import { useState, useEffect } from "react";
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
import type { Article, ArticleListResponse } from "@/types/article.type";
import type {
  ArticleCategory,
  ArticleCategoryListResponse,
} from "@/types/article-category.type";

const ArticleHomePage = () => {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [, setLatestArticles] = useState<Article[]>([]);
  const [moreArticles, setMoreArticles] = useState<Article[]>([]);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const categoriesResponse: ArticleCategoryListResponse =
        await articleCategoryService.getCategories(1, 20, "");
      setCategories(categoriesResponse.data?.data ?? []);

            const featuredResponse: ArticleListResponse = await articleService.getArticles(1, 4, '', null, null);
            setFeaturedArticles(featuredResponse.data?.data ?? []);

            const latestResponse: ArticleListResponse = await articleService.getArticles(1, 20, '', null, null);
            const allLatestArticles = latestResponse.data?.data ?? [];
            
            setLatestArticles(allLatestArticles.slice(1, 4));
            setMoreArticles(allLatestArticles.slice(4));

      setLatestArticles(allLatestArticles.slice(1, 4));
      setMoreArticles(allLatestArticles.slice(4));
    } catch (error) {
      console.error("Error fetching data:", error);
      setCategories([]);
      setFeaturedArticles([]);
      setLatestArticles([]);
      setMoreArticles([]);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const mainFeatured = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1);
  const displayedArticles = showAllArticles
    ? moreArticles
    : moreArticles.slice(0, 8);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
          {/* Left Sidebar */}
          <aside className="bg-white border-r border-gray-200 min-h-screen sticky top-0 hidden md:block">
            <nav className="p-4 space-y-1">
              <a
                href="/sforum"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                <Home size={20} />
                <span>Trang chủ</span>
              </a>

              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <a
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        size={20}
                        className="text-gray-600 group-hover:text-red-600"
                      />
                      <span className="group-hover:text-red-600">
                        {category.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-red-600"
                    />
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="px-4 py-6">
            {/* CHỦ ĐỀ HOT */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-red-600 pb-2 pr-4">
                  CHỦ ĐỀ HOT
                </h2>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
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
                                            <a
                                                key={category.id}
                                                href={`/category/${category.slug}`}
                                                className="flex-shrink-0 w-36 h-36 relative rounded-lg overflow-hidden group cursor-pointer"
                                            >
                                                {category.image ? (
                                                    <img
                                                        src={category.image}
                                                        alt={category.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full ${gradientClasses} ${category.image ? 'hidden' : ''}`} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <span className="text-white text-sm font-semibold leading-tight line-clamp-2">
                                                        #{category.title}
                                                    </span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </section>

            {/* NỘI BẬT NHẤT */}
            {mainFeatured && (
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-red-600 pb-2 pr-4">
                    NỘI BẬT NHẤT
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Featured Article - Large */}
                  <a
                    href={`/article/${mainFeatured.slug}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold z-10">
                        {mainFeatured.category.title}
                      </span>
                      <img
                        src={mainFeatured.thumbnail}
                        alt={mainFeatured.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/800x400/e5e7eb/6b7280?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                        {mainFeatured.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {mainFeatured.staffName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700">
                            {mainFeatured.staffName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatDate(mainFeatured.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Latest Articles - Right Side */}
                  <div className="space-y-4">
                    {sideArticles.map((article) => (
                      <a
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="flex gap-4 bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow p-4"
                      >
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-32 h-24 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                                {article.staffName.charAt(0).toUpperCase()}
                              </div>
                              <span>{article.staffName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{formatDate(article.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* XEM NHIỀU TUẦN QUA */}
            {moreArticles.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-red-600 pb-2 pr-4">
                    XEM NHIỀU TUẦN QUA
                  </h2>
                  {moreArticles.length > 8 && (
                    <button
                      onClick={() => setShowAllArticles(!showAllArticles)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-white text-xs font-medium bg-red-600 px-2 py-1 rounded">
                            {article.category.title}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-2">{article.staffName}</span>
                          <Clock size={11} className="mr-1" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ArticleHomePage;
