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

  // Fetch top 2 categories
  const {
    data: categoriesData,
    isLoading: loadingCategories,
  } = useQuery<CategoryListResponse>(
    () => categoryService.getCategories(1, 10),
    {
      queryKey: ['categories', 'home'],
    }
  )

  useEffect(() => {
    if (categoriesData?.data?.data) {
      setTopCategories(categoriesData.data.data.slice(0, 2))
    }
  }, [categoriesData])


  const loadArticles = async () => {
    try {
      setLoadingArticles(true)
      const response = await articleService.getArticles(1, 100)
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



  // Quick service links data
  const quickServices = [
    { icon: Zap, label: 'Deal HOT', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-50' },
    { icon: Gift, label: 'Ưu đãi thành viên', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
    { icon: RefreshCcw, label: 'Thu cũ đổi mới', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
    { icon: CreditCard, label: 'Trả góp 0%', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
  ]

  // Trust badges data
  const trustBadges = [
    { icon: Truck, title: 'Giao hàng miễn phí', desc: 'Đơn từ 300k' },
    { icon: Shield, title: 'Bảo hành chính hãng', desc: '12-24 tháng' },
    { icon: RefreshCcw, title: 'Đổi trả dễ dàng', desc: '30 ngày miễn phí' },
    { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn nhiệt tình' },
  ]

  // Side banners for each category
  const categoryBanners = [
    [
      { image: '', title: 'Giảm đến 30%', subtitle: 'Trợ giá lên đời', buttonText: 'MUA NGAY', gradient: 'from-blue-600 via-blue-700 to-indigo-800' },
      { image: '', title: 'S-Student', subtitle: 'Giảm thêm 7%', buttonText: 'XEM NGAY', gradient: 'from-purple-600 via-purple-700 to-pink-600' }
    ],
    [
      { image: '', title: 'Trợ giá 4 Triệu', subtitle: 'Thu cũ đổi mới', buttonText: 'MUA NGAY', gradient: 'from-emerald-600 via-teal-600 to-cyan-700' },
      { image: '', title: 'Trả góp 0%', subtitle: 'Lãi suất 0% 15 tháng', buttonText: 'XEM NGAY', gradient: 'from-orange-500 via-red-500 to-pink-500' }
    ]
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

      {/* Quick Services */}
      <section className="container mx-auto px-4 max-w-7xl -mt-2 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickServices.map((service, index) => (
              <button
                key={index}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl ${service.bgColor} hover:shadow-md transition-all group`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-semibold text-sm md:text-base text-gray-800">{service.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>


      <div className="container mx-auto px-4 max-w-7xl mt-8">
        {/* Category Product Sections - Like CellphoneS */}
        {loadingCategories ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
              href="/sforum"
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
