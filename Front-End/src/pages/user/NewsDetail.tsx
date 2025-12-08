import { useParams, useNavigate, Link, useLocation } from "react-router";
import {
  Clock,
  Facebook,
  ChevronRight,
  Loader2,
  Home,
  Twitter,
  Link as LinkIcon,
  Newspaper,
  Gamepad2,
  MessageSquare,
  Smartphone,
  Megaphone,
  Users,
  User,
} from "lucide-react";
import { articleService } from "@/services/article.service";
import { articleCategoryService } from "@/services/article-category.service";
import { useQuery } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ArticleResponse, ArticleListResponse } from "@/types/article.type";
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
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useQuery<ArticleCategoryListResponse>(
    () => articleCategoryService.getCategories(1, 20, ""),
    {
      queryKey: ["article-categories", "detail"],
    }
  );

  // Fetch article
  const {
    data: articleData,
    isLoading: loadingArticle,
    isError: errorArticle,
  } = useQuery<ArticleResponse>(
    () => articleService.getArticleBySlug(slug || ""),
    {
      queryKey: ["article", "detail", slug ?? ""],
      enabled: !!slug,
    }
  );

  // Fetch related articles
  const {
    data: relatedData,
  } = useQuery<ArticleListResponse>(
    () =>
      articleService.getArticles(
        1,
        4,
        "",
        articleData?.data?.category?.id ?? null,
        null
      ),
    {
      queryKey: ["articles", "related", articleData?.data?.category?.id?.toString() ?? ""],
      enabled: !!articleData?.data?.category?.id,
    }
  );

  const categories = categoriesData?.data?.data ?? [];
  const article = articleData?.data;
  const relatedArticles =
    relatedData?.data?.data?.filter((a) => a.id !== article?.id).slice(0, 3) ??
    [];

  const loading = loadingCategories || loadingArticle;
  const error = errorArticle || (!loading && !article);

  const handleShare = (platform: "facebook" | "twitter" | "copy") => {
    const url = window.location.href;
    const title = article?.title || "";

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        "_blank"
      );
    } else {
      navigator.clipboard.writeText(url);
      alert("Đã sao chép link bài viết!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <p className="text-red-600 mb-4">
          {error ? "Không thể tải bài viết. Vui lòng thử lại sau." : "Không tìm thấy bài viết"}
        </p>
        <button
          onClick={() => navigate(PUBLIC_PATH.NEWS)}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white -mx-4 -my-10 px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="sticky top-4 hidden lg:block h-fit">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Button
                  asChild
                  variant="ghost"
                  className={`
                    w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                    transition-all duration-200 ease-in-out
                    ${location.pathname === PUBLIC_PATH.NEWS
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
                  const isActive = article?.category.id === category.id;
                  return (
                    <Button
                      key={category.id}
                      asChild
                      variant="ghost"
                      className={`
                        w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                        transition-all duration-200 ease-in-out
                        ${isActive
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

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {/* Hero Section with Featured Image */}
            <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-t-xl">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/1200x600/e5e7eb/6b7280?text=No+Image";
                }}
              />
            </div>

            {/* White Content Box - Overlapping Hero by 1/4 */}
            <div className="bg-white rounded-3xl -mt-[100px] md:-mt-[125px] lg:-mt-[150px] relative z-10 shadow-2xl mx-7">
              <div className="px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12 max-w-4xl mx-auto">
                {/* Category Badge & Back Button */}
                <div className="flex items-center justify-between mb-6">
                  <Link
                    to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", article.category.slug)}`}
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-md"
                  >
                    {article.category.title}
                  </Link>
                  <Link
                    to={PUBLIC_PATH.NEWS}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    <span className="hidden sm:inline">Về trang chủ</span>
                  </Link>
                </div>

                <div className="">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {article.title}
                  </h1>

                  {/* Author & Date & Share */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold shadow-md overflow-hidden">
                        {article.staffName ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            {article.staffName.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm md:text-base">{article.staffName || "Tác giả"}</p>
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1.5 md:mr-2" />
                          <span>Ngày cập nhật: {formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare("facebook")}
                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-110"
                        title="Chia sẻ Facebook"
                      >
                        <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-all shadow-md hover:shadow-lg hover:scale-110"
                        title="Chia sẻ Twitter"
                      >
                        <Twitter size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-110"
                        title="Sao chép link"
                      >
                        <LinkIcon size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div
                    className="article-content mb-10 prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Tags */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">Chủ đề:</span>
                      <Link
                        to={`${PUBLIC_PATH.NEWS_CATEGORY.replace(":slug", article.category.slug)}`}
                        className="inline-block bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border border-gray-200 hover:border-red-200"
                      >
                        {article.category.title}
                      </Link>
                    </div>
                  </div>

                  {/* Social Share Bottom */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4 font-bold">Chia sẻ bài viết:</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleShare("facebook")}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <Facebook size={18} />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="flex items-center space-x-2 bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <Twitter size={18} />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <LinkIcon size={18} />
                        <span className="text-sm">Sao chép link</span>
                      </button>
                    </div>
                  </div>

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-gray-200">
                      <div className="flex items-center mb-6 md:mb-8">
                        <div className="h-10 w-1.5 bg-gradient-to-b from-red-600 to-red-400 rounded-full mr-4"></div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                          Bài viết liên quan
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {relatedArticles.map((related) => (
                          <Link
                            key={related.id}
                            to={`${PUBLIC_PATH.NEWS_DETAIL.replace(":slug", related.slug)}`}
                            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 overflow-hidden flex flex-col h-full hover:-translate-y-1"
                          >
                            <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                              <div className="absolute top-3 left-3 z-10">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                                  {related.category.title}
                                </span>
                              </div>
                              <img
                                src={related.thumbnail}
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-5 flex-grow flex flex-col">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3 mb-3 leading-tight">
                                {related.title}
                              </h3>
                              <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {related.staffName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-gray-600">{related.staffName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={12} />
                                  <span>{formatDate(related.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

