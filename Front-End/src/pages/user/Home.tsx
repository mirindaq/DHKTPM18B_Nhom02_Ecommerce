
import { useState, useEffect } from 'react'
import { productService } from '@/services/product.service'
import ProductCard from '@/components/user/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import type { Product } from '@/types/product.type'
import type { Article } from '@/types/article.type'
import { articleService } from '@/services/article.service'
import ArticleCard from '@/components/user/ArticleCard'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadProducts = async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      setLoading(true)
      const response = await productService.getProducts(page, 12, search)

      if (append) {
        setProducts(prev => [...prev, ...response.data.data])
      } else {
        setProducts(response.data.data)
      }

      setHasMore(page < response.data.totalPage)
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error)
    } finally {
      setLoading(false)
    }
  }

  // === LOAD ARTICLES ===
  const loadArticles = async () => {
    try {
      setLoadingArticles(true)
      // 👉 Lấy số lượng lớn hơn một chút để đảm bảo có dữ liệu
      const response = await articleService.getArticles(1, 100, '', null, null)

      // 🔽 Sắp xếp tất cả bài viết theo ngày đăng mới nhất
      const sortedArticles = response.data.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // 🔽 Giới hạn hiển thị 5 bài đầu tiên
      setArticles(sortedArticles.slice(0, 5))
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  useEffect(() => {
    loadProducts(1, searchTerm)
    loadArticles()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadProducts(1, searchTerm)
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadProducts(nextPage, searchTerm, true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Trang chủ Ecommerce</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </form>
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  'Xem thêm sản phẩm'
                )}
              </Button>
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </>
      )}
      {/* ================== ARTICLE SECTION ================== */}
      <section className="bg-gray-50 py-12 mt-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tin tức</h2>
            <a
              href="/sforum"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </a>
          </div>

          {loadingArticles ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>

  )
}
