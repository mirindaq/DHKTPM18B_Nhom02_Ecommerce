import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Home, ChevronRight, Loader2, Newspaper, Gamepad2, MessageSquare, Smartphone, Megaphone, Users } from 'lucide-react';
import { articleService } from '@/services/article.service';
import { articleCategoryService } from '@/services/article-category.service';
import type { Article } from '@/types/article.type';
import type { ArticleCategory } from '@/types/article-category.type';

export default function ArticleSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        categoryParam ? Number(categoryParam) : null
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (query) {
            searchArticles();
        }
    }, [query, page, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await articleCategoryService.getCategories(1, 100, '');
            setCategories(response.data?.data ?? []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const searchArticles = async () => {
        try {
            setLoading(true);
            const response = await articleService.getArticles(
                page, 
                10, 
                query, 
                selectedCategory, 
                null
            );
            setArticles(response.data?.data ?? []);
            setTotalPages(response.data?.totalPage ?? 1);
        } catch (error) {
            console.error('Error searching articles:', error);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

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
        setSelectedCategory(categoryId);
        setPage(1);
        if (categoryId) {
            setSearchParams({ q: query, category: String(categoryId) });
        } else {
            setSearchParams({ q: query });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex">
                    {/* Left Sidebar - Categories */}
                    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 hidden md:block">
                        <nav className="p-4 space-y-1">
                            <a
                                href="/sforum"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                            >
                                <Home size={20} className="text-gray-600 group-hover:text-red-600" />
                                <span className="group-hover:text-red-600">Trang chủ</span>
                            </a>

                            <button
                                onClick={() => handleCategoryClick(null)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                                    selectedCategory === null
                                        ? 'bg-red-50 text-red-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Newspaper size={20} className={selectedCategory === null ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'} />
                                    <span className={selectedCategory === null ? '' : 'group-hover:text-red-600'}>Tất cả</span>
                                </div>
                            </button>

                            {categories.map((category) => {
                                const Icon = getCategoryIcon(category.slug);
                                const isActive = selectedCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                                            isActive
                                                ? 'bg-red-50 text-red-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={20} className={isActive ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'} />
                                            <span className={isActive ? '' : 'group-hover:text-red-600'}>{category.title}</span>
                                        </div>
                                        <ChevronRight size={16} className={isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'} />
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 px-6 py-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <a href="/sforum" className="hover:text-red-600">Trang chủ</a>
                            <ChevronRight size={14} />
                            <span className="text-gray-900">Tìm kiếm: {query}</span>
                        </div>

                        {/* Search Header */}
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                Bạn đang tìm kiếm: <span className="text-red-600">{query}</span>
                            </h1>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Không tìm thấy kết quả phù hợp</p>
                                <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        ) : (
                            <>
                                {/* Articles List */}
                                <div className="space-y-4">
                                    {articles.map((article) => (
                                        <a
                                            key={article.id}
                                            href={`/article/${article.slug}`}
                                            className="flex gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow group"
                                        >
                                            <img
                                                src={article.thumbnail}
                                                alt={article.title}
                                                className="w-40 h-28 object-cover rounded flex-shrink-0"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                                                    {article.title}
                                                </h3>
                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                    <span className="text-red-600 font-medium">{article.category.title}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(article.createdAt)}</span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8 gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                            Trang {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
