import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronRight, Home, Loader2, Newspaper, Gamepad2, MessageSquare, Smartphone, Megaphone, Users } from 'lucide-react';
import { articleService } from '@/services/article.service';
import { articleCategoryService } from '@/services/article-category.service';
import type { Article, ArticleListResponse } from '@/types/article.type';
import type { ArticleCategory, ArticleCategoryResponse } from '@/types/article-category.type';


const ArticleCategoryPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<ArticleCategory | null>(null);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (slug) {
            fetchCategoryAndArticles();
        }
    }, [slug, currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await articleCategoryService.getCategories(1, 100, '');
            setCategories(response.data?.data ?? []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchCategoryAndArticles = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Get category info (Unwrap Response)
            const response: ArticleCategoryResponse = await articleCategoryService.getCategoryBySlug(slug!);
            const categoryData: ArticleCategory = response.data;
            setCategory(categoryData);

            // 2. Get articles by category (Response là ArticleListResponse)
            const articlesResponse: ArticleListResponse = await articleService.getArticles(
                currentPage,
                10,
                '',
                categoryData.id,
                null
            );

            // SỬA: Lấy data.data (là Article[]) và kiểm tra an toàn
            setArticles(articlesResponse.data?.data ?? []);
            setTotalPages(articlesResponse.data?.totalPage ?? 1);

        } catch (err) {
            console.error('Error fetching category articles:', err);
            setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            setCategory(null);
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

    if (loading && !category) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy chuyên mục'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

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

                            {categories.map((cat) => {
                                const Icon = getCategoryIcon(cat.slug);
                                const isActive = category?.id === cat.id;
                                return (
                                    <a
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                                            isActive
                                                ? 'bg-red-50 text-red-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={20} className={isActive ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'} />
                                            <span className={isActive ? '' : 'group-hover:text-red-600'}>{cat.title}</span>
                                        </div>
                                        <ChevronRight size={16} className={isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'} />
                                    </a>
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
                            <span className="text-gray-900">{category?.title}</span>
                        </div>

                        {/* Category Header */}
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                {category?.title}
                            </h1>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Chưa có bài viết nào trong chuyên mục này</p>
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
                                                    <span className="text-red-600 font-medium">{category?.title}</span>
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
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
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
};



export default ArticleCategoryPage;
