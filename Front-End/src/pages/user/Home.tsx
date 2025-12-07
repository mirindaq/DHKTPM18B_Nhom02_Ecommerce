import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { articleService } from "@/services/article.service";
import { categoryService } from "@/services/category.service";
import ArticleCard from "@/components/user/ArticleCard";
import HeroBanner from "@/components/user/HeroBanner";
import CategoryProductSection from "@/components/user/CategoryProductSection";
import { useUser } from "@/context/UserContext";
import { USER_PATH, PUBLIC_PATH } from "@/constants/path";
import {
  Loader2,
  Zap,
  Gift,
  RefreshCcw,
  CreditCard,
  Truck,
  Shield,
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

  // Fetch top 2 categories
  const { data: categoriesData, isLoading: loadingCategories } =
    useQuery<CategoryListResponse>(() => categoryService.getCategories(1, 10), {
      queryKey: ["categories", "home"],
    });

  useEffect(() => {
    if (categoriesData?.data?.data) {
      setTopCategories(categoriesData.data.data.slice(0, 2));
    }
  }, [categoriesData]);

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

  // Quick service links data
  const quickServices = [
    {
      icon: Zap,
      label: "Deal HOT",
      color: "from-red-500 via-orange-500 to-yellow-500",
      iconBg: "bg-gradient-to-br from-red-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
      borderColor: "border-red-200",
    },
    {
      icon: Gift,
      label: "Ưu đãi Smember",
      color: "from-purple-500 via-pink-500 to-rose-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
    },
    {
      icon: RefreshCcw,
      label: "Thu cũ đổi mới",
      color: "from-green-500 via-emerald-500 to-teal-500",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      icon: CreditCard,
      label: "Trả góp 0%",
      color: "from-blue-500 via-cyan-500 to-sky-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
    },
  ];

  // Trust badges data with colors
  const trustBadges = [
    {
      icon: Truck,
      title: "Giao hàng miễn phí",
      desc: "Đơn từ 300.000đ",
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      icon: Shield,
      title: "Bảo hành chính hãng",
      desc: "Lên đến 24 tháng",
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
    },
    {
      icon: RefreshCcw,
      title: "Đổi trả dễ dàng",
      desc: "Trong vòng 30 ngày",
      gradient: "from-orange-500 to-red-500",
      bg: "bg-orange-50",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn miễn phí",
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
    },
  ];

  // Side banners for each category
  const categoryBanners = [
    [
      {
        image: "",
        title: "Giảm đến 30%",
        subtitle: "Trợ giá lên đời",
        buttonText: "MUA NGAY",
        gradient: "from-blue-600 via-blue-700 to-indigo-800",
      },
      {
        image: "",
        title: "S-Student",
        subtitle: "Giảm thêm 7%",
        buttonText: "XEM NGAY",
        gradient: "from-purple-600 via-purple-700 to-pink-600",
      },
    ],
    [
      {
        image: "",
        title: "Trợ giá 4 Triệu",
        subtitle: "Thu cũ đổi mới",
        buttonText: "MUA NGAY",
        gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      },
      {
        image: "",
        title: "Trả góp 0%",
        subtitle: "Lãi suất 0% 15 tháng",
        buttonText: "XEM NGAY",
        gradient: "from-orange-500 via-red-500 to-pink-500",
      },
    ],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <section className="relative bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Banner */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <HeroBanner />
              </div>
            </div>

            {/* Side Member Banner */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-gray-100 hover:shadow-xl transition-all duration-300">
                {/* Header */}
                {isAuthenticated && user ? (
                  // Đã đăng nhập
                  <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 p-5 text-white relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50">
                          <Crown className="w-7 h-7 text-yellow-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight">
                            {user.fullName}
                          </h3>
                          <p className="text-sm opacity-90 mt-0.5">
                            {user.phone?.replace(
                              /(\d{3})(\d{4})(\d+)/,
                              "$1****$3"
                            ) || "Chưa có SĐT"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-yellow-400 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          {user.rank?.name?.toUpperCase() || "MEMBER"}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Percent className="w-3 h-3" />-
                          {user.rank?.discountRate || 0}%
                        </span>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold mb-1">
                          🎁 Ưu đãi của bạn
                        </p>
                        <p className="text-sm font-bold">
                          Giảm {user.rank?.discountRate || 0}% mọi đơn hàng
                        </p>
                      </div>

                      <Link
                        to={USER_PATH.MEMBERSHIP}
                        className="flex items-center justify-center gap-2 bg-white text-red-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50 transition-colors shadow-md"
                      >
                        <Gift className="w-4 h-4" />
                        Xem tất cả ưu đãi
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Chưa đăng nhập
                  <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 p-5 text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                          <Gift className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">
                            Chào mừng đến
                          </h3>
                          <p className="font-bold text-lg">CellphoneS</p>
                        </div>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
                        <p className="text-sm font-medium">
                          🎉 Nhận ngay ưu đãi khi trở thành Smember
                        </p>
                      </div>

                      <div className="flex gap-2 mb-3">
                        <Link
                          to="/login"
                          className="flex-1 bg-white text-red-600 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-50 transition-colors text-center shadow-md"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          className="flex-1 bg-yellow-400 text-red-700 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors text-center shadow-md"
                        >
                          Đăng ký
                        </Link>
                      </div>

                      <Link
                        to={PUBLIC_PATH.MEMBERSHIP}
                        className="flex items-center justify-center gap-1 text-sm hover:underline opacity-90"
                      >
                        <Gift className="w-4 h-4" />
                        Tìm hiểu về Smember
                        <ChevronRight className="w-4 h-4" />
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

      {/* Quick Services */}
      <section className="container mx-auto px-4 max-w-7xl mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickServices.map((service, index) => (
              <button
                key={index}
                className={`group relative overflow-hidden flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl ${service.bgColor} border ${service.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${service.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10`}
                >
                  <service.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <span className="font-bold text-sm md:text-base text-gray-800 text-center leading-tight relative z-10">
                  {service.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl mt-6">
        {/* Category Product Sections */}
        {loadingCategories ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-red-500" />
              <p className="text-gray-500 font-medium">Đang tải sản phẩm...</p>
            </div>
          </div>
        ) : (
          topCategories.map((category, index) => (
            <CategoryProductSection
              key={category.id}
              category={category}
              sideBanners={categoryBanners[index] || categoryBanners[0]}
            />
          ))
        )}

        {/* Trust Badges */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}
              >
                {/* Background decoration */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${badge.gradient} opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}
                ></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${badge.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}
                  >
                    <badge.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">
                      {badge.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-snug">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Article Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-7 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-red-600 via-orange-500 to-yellow-500 rounded-full shadow-md" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                  Tin tức & Khuyến mãi
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  📰 Cập nhật mới nhất mỗi ngày
                </p>
              </div>
            </div>
            <a
              href="/news"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-rose-600 transition-all group shadow-md hover:shadow-lg"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                <p className="text-gray-500 font-medium">Đang tải tin tức...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
