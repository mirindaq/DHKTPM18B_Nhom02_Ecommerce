import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Facebook, ChevronRight, Loader2, Home, Twitter, Link as LinkIcon, Newspaper, Gamepad2, MessageSquare, Smartphone, Megaphone, Users } from 'lucide-react';
import { articleService } from '@/services/article.service';
import { articleCategoryService } from '@/services/article-category.service';
import type { Article, ArticleListResponse, ArticleResponse } from '@/types/article.type';
import type { ArticleCategory, ArticleCategoryListResponse } from '@/types/article-category.type';

const ArticleDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch categories for sidebar
            const categoriesResponse: ArticleCategoryListResponse = await articleCategoryService.getCategories(1, 20, '');
            setCategories(categoriesResponse.data?.data ?? []);

            const responseWrapper: ArticleResponse = await articleService.getArticleBySlug(slug!);
            const articleData: Article = responseWrapper.data;
            setArticle(articleData);

            if (articleData.category) {
                const relatedResponse: ArticleListResponse = await articleService.getArticles(
                    1,
                    4,
                    '',
                    true,
                    articleData.category.id
                );
                setRelatedArticles((relatedResponse.data?.data ?? []).filter((a: { id: number; }) => a.id !== articleData.id).slice(0, 3));
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            setArticle(null);
            setRelatedArticles([]);
        } finally {
            setLoading(false);
        }
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
        const url = window.location.href;
        const title = article?.title || '';

        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        } else {
            navigator.clipboard.writeText(url);
            alert('Đã sao chép link bài viết!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
                <button
                    onClick={() => navigate('/sforum')}
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
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
                    {/* Left Sidebar - Categories */}
                    <aside className="bg-white border-r border-gray-200 min-h-screen sticky top-0 hidden md:block">
                        <nav className="p-4 space-y-1">
                            <a
                                href="/sforum"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Home size={20} />
                                <span>Trang chủ</span>
                            </a>

                            {categories.map((category) => {
                                const Icon = getCategoryIcon(category.slug);
                                const isActive = article?.category.id === category.id;
                                return (
                                    <a
                                        key={category.id}
                                        href={`/category/${category.slug}`}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                                            isActive 
                                                ? 'bg-red-50 text-red-600 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon size={20} className={`${isActive ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'}`} />
                                            <span className={isActive ? 'text-red-600' : 'group-hover:text-red-600'}>{category.title}</span>
                                        </div>
                                        <ChevronRight size={16} className={`${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}`} />
                                    </a>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white">
                        {/* Breadcrumb */}
                        <div className="border-b border-gray-200">
                            <div className="px-6 py-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Home size={14} className="mr-2" />
                                    <a href="/sforum" className="hover:text-red-600 transition-colors">Trang chủ</a>
                                    <ChevronRight size={14} className="mx-2" />
                                    <a
                                        href={`/category/${article.category.slug}`}
                                        className="hover:text-red-600 transition-colors"
                                    >
                                        {article.category.title}
                                    </a>
                                    <ChevronRight size={14} className="mx-2" />
                                    <span className="text-gray-900 font-medium truncate">{article.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="px-6 py-6 max-w-4xl mx-auto">
                            {/* Category Badge */}
                            <div className="mb-4">
                                <a 
                                    href={`/category/${article.category.slug}`}
                                    className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                                >
                                    {article.category.title}
                                </a>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {article.title}
                            </h1>

                            {/* Author & Date & Share */}
                            <div className="flex items-center justify-between pb-4 mb-6 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {article.staffName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{article.staffName}</p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock size={12} className="mr-1" />
                                            <span>{formatDate(article.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Share Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        title="Chia sẻ Facebook"
                                    >
                                        <Facebook size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-9 h-9 flex items-center justify-center bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                                        title="Chia sẻ Twitter"
                                    >
                                        <Twitter size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-9 h-9 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                        title="Sao chép link"
                                    >
                                        <LinkIcon size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Featured Image - Full Width */}
                            <div className="mb-8 -mx-6">
                                <img
                                    src={article.thumbnail}
                                    alt={article.title}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://placehold.co/1200x600/e5e7eb/6b7280?text=No+Image';
                                    }}
                                />
                            </div>

                            {/* Article Content */}
                            <div
                                className="article-content mb-8"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />

                            {/* Tags */}
                            <div className="pt-6 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700">Chủ đề:</span>
                                    <a
                                        href={`/category/${article.category.slug}`}
                                        className="inline-block bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                                    >
                                        {article.category.title}
                                    </a>
                                </div>
                            </div>

                            {/* Social Share Bottom */}
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-gray-600 mb-3 font-semibold">Chia sẻ bài viết:</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Facebook size={18} />
                                        <span className="text-sm font-medium">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="flex items-center space-x-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                                    >
                                        <Twitter size={18} />
                                        <span className="text-sm font-medium">Twitter</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <LinkIcon size={18} />
                                        <span className="text-sm font-medium">Sao chép link</span>
                                    </button>
                                </div>
                            </div>

                            {/* Related Articles */}
                            {relatedArticles.length > 0 && (
                                <div className="mt-8 pt-8 border-t">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Bài viết liên quan
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {relatedArticles.map((related) => (
                                            <a
                                                key={related.id}
                                                href={`/article/${related.slug}`}
                                                className="group"
                                            >
                                                <div className="relative overflow-hidden rounded-lg mb-3">
                                                    <img
                                                        src={related.thumbnail}
                                                        alt={related.title}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image';
                                                        }}
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            {related.category.title}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                                                    {related.title}
                                                </h3>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock size={12} className="mr-1" />
                                                    <span>{formatDate(related.createdAt)}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailPage;
