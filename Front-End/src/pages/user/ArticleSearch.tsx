import { useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router';
import { Home, ChevronRight, Loader2, Newspaper, Gamepad2, MessageSquare, Smartphone, Megaphone, Users, Clock } from 'lucide-react';
import { articleService } from '@/services/article.service';
import { articleCategoryService } from '@/services/article-category.service';
import { useQuery } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ArticleListResponse } from '@/types/article.type';
import type { ArticleCategoryListResponse } from '@/types/article-category.type';
import { PUBLIC_PATH } from '@/constants/path';

export default function ArticleSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const [page, setPage] = useState(1);
    const selectedCategory = categoryParam ? Number(categoryParam) : null;

    // Fetch categories
    const {
        data: categoriesData,
        isLoading: loadingCategories,
    } = useQuery<ArticleCategoryListResponse>(
        () => articleCategoryService.getCategories(1, 100, ''),
        {
            queryKey: ['article-categories', 'search'],
        }
    );

    // Fetch search results
    const {
        data: articlesData,
        isLoading: loadingArticles,
    } = useQuery<ArticleListResponse>(
        () => articleService.getArticles(page, 10, query, selectedCategory, null),
        {
            queryKey: ['articles', 'search', query, selectedCategory ? String(selectedCategory) : '', String(page)],
            enabled: !!query,
        }
    );

    const categories = categoriesData?.data?.data ?? [];
    const articles = articlesData?.data?.data ?? [];
    const totalPages = articlesData?.data?.totalPage ?? 1;
    const loading = loadingCategories || loadingArticles;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryIcon = (slug: string) => {
        const iconMap: Record<string, any> = {
            'tin-cong-nghe': Newspaper,
            's-games': Gamepad2,
            'tu-van': MessageSquare,
            'tren-tay': Smartphone,
            'danh-gia': MessageSquare,
            'thu-thuat': MessageSquare,
            'khuyen-mai': Megaphone,
            'tuyen-dung': Users,
        };
        return iconMap[slug] || Newspaper;
    };

    const handleCategoryClick = (categoryId: number | null) => {
        setPage(1);
        if (categoryId) {
            setSearchParams({ q: query, category: String(categoryId) });
        } else {
            setSearchParams({ q: query });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
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

                                <Button
                                    onClick={() => handleCategoryClick(null)}
                                    variant="ghost"
                                    className={`
                                        w-full justify-start gap-3 rounded-none !text-base !font-medium !py-6 !px-4
                                        transition-all duration-200 ease-in-out
                                        ${
                                            selectedCategory === null
                                                ? "!bg-red-50 !text-red-600 !border-l-4 !border-red-600 hover:!bg-red-100 hover:!text-red-700"
                                                : "!text-gray-700 !border-l-4 !border-transparent hover:!bg-gray-100 hover:!text-gray-900 hover:!border-l-4 hover:!border-red-300"
                                        }
                                    `}
                                >
                                    <Newspaper size={22} />
                                    <span>Tất cả</span>
                                </Button>

                                {categories.map((category) => {
                                    const Icon = getCategoryIcon(category.slug);
                                    const isActive = selectedCategory === category.id;
                                    return (
                                        <Button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.id)}
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
                                            <Icon size={22} />
                                            <span>{category.title}</span>
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-5 pb-4 border-b border-gray-200">
                            <Home size={14} className="text-gray-400" />
                            <Link to={PUBLIC_PATH.NEWS} className="hover:text-red-600 transition-colors font-medium">Trang chủ</Link>
                            <ChevronRight size={12} className="text-gray-400" />
                            <span className="text-gray-900 font-semibold">Tìm kiếm: {query}</span>
                        </div>

                        {/* Search Header */}
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <div className="h-8 w-1 bg-gradient-to-b from-red-600 to-red-400 rounded-full mr-3"></div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Kết quả tìm kiếm: <span className="text-red-600">{query}</span>
                                </h1>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg font-medium mb-2">Không tìm thấy kết quả phù hợp</p>
                                <p className="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        ) : (
                            <>
                                {/* Articles List */}
                                <div className="space-y-4">
                                    {articles.map((article) => (
                                        <Link
                                            key={article.id}
                                            to={`${PUBLIC_PATH.NEWS_DETAIL.replace(':slug', article.slug)}`}
                                            className="flex gap-4 bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 group border border-gray-200 hover:border-red-200 hover:-translate-y-0.5"
                                        >
                                            <img
                                                src={article.thumbnail}
                                                alt={article.title}
                                                className="w-44 h-32 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3">
                                                    {article.title}
                                                </h3>
                                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                                    <span className="text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-lg">{article.category.title}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <div className="flex items-center">
                                                        <Clock size={14} className="mr-1.5" />
                                                        <span>{formatDate(article.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8 gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-red-300 transition-all font-medium shadow-sm hover:shadow-md"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-5 py-2.5 bg-red-600 text-white border border-red-600 rounded-lg font-semibold shadow-md">
                                            Trang {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-red-300 transition-all font-medium shadow-sm hover:shadow-md"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
