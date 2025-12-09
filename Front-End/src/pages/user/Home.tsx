import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { articleService } from '@/services/article.service'
import { categoryService } from '@/services/category.service'
import ArticleCard from '@/components/user/ArticleCard'
import HeroBanner from '@/components/user/HeroBanner'
import CategoryProductSection from '@/components/user/CategoryProductSection'
import { useUser } from '@/context/UserContext'
import { USER_PATH, PUBLIC_PATH } from '@/constants/path'
import { 
  Loader2, 
  Gift, 
  Truck,
  Shield,
  RefreshCcw,
  Headphones,
  ChevronRight,
  Package,
  History,
  Crown,
  MapPin,
  Heart,
  LogOut,
  Percent,
} from "lucide-react";
import { useQuery } from "@/hooks";
import type { Article } from "@/types/article.type";
import type { Category, CategoryListResponse } from "@/types/category.type";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  // Fetch all categories
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useQuery<CategoryListResponse>(
    () => categoryService.getAllCategoriesSimple(),
    {
      queryKey: ['categories', 'home'],
    }
  )

  useEffect(() => {
    if (categoriesData?.data?.data) {
      // Lấy tất cả categories có status = true
      const activeCategories = categoriesData.data.data.filter(cat => cat.status)
      setTopCategories(activeCategories)
    }
  }, [categoriesData])

  // Lấy top 2 categories để hiển thị sản phẩm
  const top2Categories = topCategories.slice(0, 2)


  const loadArticles = async () => {
    try {
      setLoadingArticles(true);
      const response = await articleService.getArticles(1, 100, "", null, null);
      const sortedArticles = response.data.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setArticles(sortedArticles.slice(0, 5));
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PUBLIC_PATH.HOME);
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Trust badges data
  const trustBadges = [
    {
      icon: Truck,
      title: "Giao hàng miễn phí",
      desc: "Đơn từ 300.000đ",
    },
    {
      icon: Shield,
      title: "Bảo hành chính hãng",
      desc: "Lên đến 24 tháng",
    },
    {
      icon: RefreshCcw,
      title: "Đổi trả dễ dàng",
      desc: "Trong vòng 30 ngày",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn miễn phí",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 py-2 mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-stretch">
            {/* Main Banner */}
            <div className="lg:col-span-3 flex">
              <HeroBanner />
            </div>

            {/* Side Member Banner */}
            <div className="hidden lg:flex">
              <div className="bg-white rounded-2xl overflow-hidden w-full border border-gray-200 transition-all duration-300 flex flex-col shadow-sm">
                {/* Header */}
                {isAuthenticated && user ? (
                  // Đã đăng nhập
                  <div className="bg-gradient-to-br from-red-600 to-red-500 p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                          <Crown className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base leading-tight">
                            {user.fullName}
                          </h3>
                          <p className="text-xs opacity-90 mt-0.5">
                            {user.phone?.replace(
                              /(\d{3})(\d{4})(\d+)/,
                              "$1****$3"
                            ) || "Chưa có SĐT"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {user.rank?.name?.toUpperCase() || "MEMBER"}
                        </span>
                        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <Percent className="w-3 h-3" />-
                          {user.rank?.discountRate || 0}%
                        </span>
                      </div>

                      <div className="bg-white/15 rounded-lg p-2.5 mb-2.5">
                        <p className="text-xs font-semibold mb-0.5">
                          🎁 Ưu đãi của bạn
                        </p>
                        <p className="text-xs font-bold">
                          Giảm {user.rank?.discountRate || 0}% mọi đơn hàng
                        </p>
                      </div>

                      <Link
                        to={USER_PATH.MEMBERSHIP}
                        className="flex items-center justify-center gap-2 bg-white text-red-600 py-2 rounded-lg font-semibold text-xs hover:bg-red-50 transition-colors"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Xem tất cả ưu đãi
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Chưa đăng nhập
                  <div className="bg-gradient-to-br from-red-600 to-red-500 p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                          <Gift className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base leading-tight">
                            Chào mừng đến
                          </h3>
                          <p className="font-bold text-base">EcomStore</p>
                        </div>
                      </div>

                      <div className="bg-white/15 rounded-lg p-2.5 mb-2.5">
                        <p className="text-xs font-medium">
                          🎉 Nhận ngay ưu đãi khi trở thành Smember
                        </p>
                      </div>

                      <div className="flex gap-2 mb-2.5">
                        <Link
                          to="/login"
                          className="flex-1 bg-white text-red-600 py-2 rounded-lg font-semibold text-xs hover:bg-red-50 transition-colors text-center"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          className="flex-1 bg-white/20 text-white py-2 rounded-lg font-semibold text-xs hover:bg-white/30 transition-colors text-center border border-white/30"
                        >
                          Đăng ký
                        </Link>
                      </div>

                      <Link
                        to={PUBLIC_PATH.MEMBERSHIP}
                        className="flex items-center justify-center gap-1 text-xs hover:underline opacity-90"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Tìm hiểu về Smember
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="p-3 space-y-0.5">
                  <Link
                    to={USER_PATH.ORDERS}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium flex-1">
                      Đơn hàng của tôi
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to={USER_PATH.ORDERS}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <History className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium flex-1">
                      Lịch sử mua hàng
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to={USER_PATH.MEMBERSHIP}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium flex-1">
                      Hạng thành viên
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to={USER_PATH.ADDRESSES}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium flex-1">
                      Địa chỉ giao hàng
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    to={USER_PATH.WISHLIST}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium flex-1">
                      Sản phẩm yêu thích
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {isAuthenticated && (
                    <>
                      <div className="border-t my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium flex-1">
                          Đăng xuất
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Danh mục sản phẩm</h2>
              <p className="text-sm text-gray-500">Khám phá các danh mục</p>
            </div>
          </div>

          {loadingCategories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : topCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`${PUBLIC_PATH.HOME}search/${category.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-md bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                >
                  <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={category.image || "/assets/avatar.jpg"}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/avatar.jpg";
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors text-center line-clamp-2">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có danh mục nào</p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Category Product Sections - Hiển thị sản phẩm theo category */}
        {loadingCategories ? (
          <div className="flex justify-center items-center py-12 mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : (
          top2Categories.map((category) => (
            <CategoryProductSection 
              key={category.id}
              category={category}
            />
          ))
        )}

        {/* Trust Badges */}
        <section className="mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    index === 0 ? 'bg-orange-100' : 
                    index === 1 ? 'bg-blue-100' : 
                    index === 2 ? 'bg-purple-100' : 
                    'bg-green-100'
                  }`}>
                    {index === 0 && <badge.icon className="w-4 h-4 text-orange-600" />}
                    {index === 1 && <badge.icon className="w-4 h-4 text-blue-600" />}
                    {index === 2 && <badge.icon className="w-4 h-4 text-purple-600" />}
                    {index === 3 && <badge.icon className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{badge.title}</p>
                    <p className="text-xs text-gray-600">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Article Section */}
        <section className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Tin tức & Khuyến mãi</h2>
                <p className="text-sm text-gray-500">Cập nhật mới nhất mỗi ngày</p>
              </div>
            </div>
            <Link
              to={PUBLIC_PATH.NEWS}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có tin tức nào</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
