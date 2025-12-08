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
  LogOut
} from 'lucide-react'
import { useQuery } from '@/hooks'
import type { Article } from '@/types/article.type'
import type { Category, CategoryListResponse } from '@/types/category.type'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [topCategories, setTopCategories] = useState<Category[]>([])
  const { user, isAuthenticated, logout } = useUser()
  const navigate = useNavigate()

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
      setLoadingArticles(true)
      // 👉 Lấy số lượng lớn hơn một chút để đảm bảo có dữ liệu
      const response = await articleService.getArticles(1, 100, '', null, null)

      // 🔽 Sắp xếp tất cả bài viết theo ngày đăng mới nhất
      const sortedArticles = response.data.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setArticles(sortedArticles.slice(0, 5))
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PUBLIC_PATH.HOME)
      window.location.reload() // Reload để cập nhật UI
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])



  // Trust badges data
  const trustBadges = [
    { icon: Truck, title: 'Giao hàng miễn phí', desc: 'Đơn từ 300k' },
    { icon: Shield, title: 'Bảo hành chính hãng', desc: '12-24 tháng' },
    { icon: RefreshCcw, title: 'Đổi trả dễ dàng', desc: '30 ngày miễn phí' },
    { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn nhiệt tình' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Banner */}
      <section className="relative">
        <div className="container mx-auto px-4 pt-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Banner */}
            <div className="lg:col-span-3">
              <HeroBanner />
            </div>
            
            {/* Side Member Banner */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                {/* Header */}
                {isAuthenticated && user ? (
                  // Đã đăng nhập
                  <div className="bg-gradient-to-b from-red-600 to-rose-400 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{user.fullName}</h3>
                        <p className="text-sm opacity-90">
                          {user.phone?.replace(/(\d{3})(\d{4})(\d+)/, '$1****$3') || 'Chưa có SĐT'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                        {user.rank?.name?.toUpperCase() || 'MEMBER'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm opacity-90">Hạng thành viên</p>
                      <p className="text-xs opacity-80">
                        Giảm thêm {user.rank?.discountRate || 0}% cho đơn hàng
                      </p>
                    </div>
                    <Link to={USER_PATH.MEMBERSHIP} className="flex items-center gap-1 mt-3 text-sm hover:underline">
                      <Gift className="w-4 h-4" />
                      Xem ưu đãi của bạn
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  // Chưa đăng nhập
                  <div className="bg-gradient-to-b from-red-500 to-rose-400 p-4 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">Chào mừng bạn đến</h3>
                        <p className="font-bold">với CellphoneS</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 mb-3">
                      Nhập hội thành viên Smember để không bỏ lỡ các ưu đãi hấp dẫn.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Link 
                        to="/login"
                        className="text-yellow-300 hover:underline font-medium"
                      >
                        Đăng nhập
                      </Link>
                      <span>hoặc</span>
                      <Link to="/register" className="text-yellow-300 hover:underline font-medium">
                        Đăng ký
                      </Link>
                    </div>
                    <Link to={PUBLIC_PATH.MEMBERSHIP} className="flex items-center gap-1 mt-3 text-sm hover:underline">
                      <Gift className="w-4 h-4" />
                      Xem ưu đãi Smember
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Quick Links */}
                <div className="p-3 space-y-1">
                  <Link to={USER_PATH.ORDERS} className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">Đơn hàng của tôi</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                  <Link to={USER_PATH.ORDERS} className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <History className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Lịch sử mua hàng</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                  <Link to={USER_PATH.MEMBERSHIP} className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium">Hạng thành viên</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                  <Link to={USER_PATH.ADDRESSES} className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Địa chỉ giao hàng</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                  <Link to={USER_PATH.WISHLIST} className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium">Sản phẩm yêu thích</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </Link>
                  {isAuthenticated && (
                    <>
                      <div className="border-t my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
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
      <section className="container mx-auto px-4 max-w-7xl mt-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Danh mục sản phẩm</h2>
                <p className="text-sm text-gray-500">Khám phá các danh mục</p>
              </div>
            </div>
          </div>

          {loadingCategories ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : topCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`${PUBLIC_PATH.HOME}search/${category.slug}`}
                  className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 group-hover:scale-105 transition-transform duration-300">
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
                  <span className="text-sm md:text-base font-medium text-gray-700 group-hover:text-red-600 transition-colors flex-1 line-clamp-2">
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

      <div className="container mx-auto px-4 max-w-7xl mt-8">
        {/* Category Product Sections - Hiển thị sản phẩm theo category */}
        {loadingCategories ? (
          <div className="flex justify-center items-center py-16 mb-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">{badge.title}</h3>
                    <p className="text-gray-500 text-xs md:text-sm">{badge.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Article Section */}
        <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tin tức & Khuyến mãi</h2>
                <p className="text-sm text-gray-500">Cập nhật mới nhất</p>
              </div>
            </div>
            <a
              href="/news"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors group"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
  )
}
