import { useState, useMemo, useEffect } from 'react'
import { productService } from '@/services/product.service'
import { articleService } from '@/services/article.service'
import ProductCard from '@/components/user/ProductCard'
import ArticleCard from '@/components/user/ArticleCard'
import HeroBanner from '@/components/user/HeroBanner'
import CategorySection from '@/components/user/CategorySection'
import BrandSection from '@/components/user/BrandSection'
import FeaturedProductsSection from '@/components/user/FeaturedProductsSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, X } from 'lucide-react'
import { useQuery } from '@/hooks'
import type { ProductListResponse, Product } from '@/types/product.type'
import type { Article } from '@/types/article.type'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const pageSize = 20

  const {
    data: productsData,
    isLoading: loading,
    refetch: refetchProducts,
  } = useQuery<ProductListResponse>(
    () => productService.getProducts(currentPage, pageSize, searchTerm),
    {
      queryKey: ['products', currentPage.toString(), pageSize.toString(), searchTerm],
    }
  )

  const hasMore = productsData ? currentPage < productsData.data.totalPage : false

  // Append products when page changes (for load more)
  useEffect(() => {
    if (productsData?.data.data) {
      if (currentPage === 1) {
        setAllProducts(productsData.data.data)
      } else {
        setAllProducts(prev => [...prev, ...productsData.data.data])
      }
    }
  }, [productsData, currentPage])

  // Filter products by category and brand
  const products = useMemo(() => {
    let filtered = allProducts

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory)
    }

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brandId === selectedBrand)
    }

    return filtered
  }, [allProducts, selectedCategory, selectedBrand])

  // Load articles
  const loadArticles = async () => {
    try {
      setLoadingArticles(true)
      const response = await articleService.getArticles(1, 100)

      // Sắp xếp tất cả bài viết theo ngày đăng mới nhất
      const sortedArticles = response.data.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Giới hạn hiển thị 5 bài đầu tiên
      setArticles(sortedArticles.slice(0, 5))
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setAllProducts([])
    refetchProducts()
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSearchTerm('')
    setCurrentPage(1)
    setAllProducts([])
    refetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Search Bar */}
        <div className="mb-6 mt-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Category Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <CategorySection 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Brand Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <BrandSection 
            selectedBrand={selectedBrand}
            onBrandSelect={setSelectedBrand}
          />
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedBrand) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Bộ lọc:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Danh mục đã chọn
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Thương hiệu đã chọn
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm h-7"
            >
              Xóa tất cả
            </Button>
          </div>
        )}

        {/* Featured Products */}
        {!selectedCategory && !selectedBrand && (
          <FeaturedProductsSection title="Sản phẩm nổi bật" limit={8} />
        )}

        {/* All Products */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory || selectedBrand ? 'Kết quả tìm kiếm' : 'Tất cả sản phẩm'}
            </h2>
            {products.length > 0 && (
              <span className="text-sm text-gray-500">
                {products.length} sản phẩm
              </span>
            )}
          </div>

          {loading && allProducts.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {hasMore && !selectedCategory && !selectedBrand && (
                    <div className="text-center">
                      <Button
                        onClick={loadMore}
                        disabled={loading}
                        variant="outline"
                        className="px-6"
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
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm nào</p>
                  {(selectedCategory || selectedBrand) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Article Section */}
        <section className="bg-white rounded-lg shadow-sm py-8 px-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tin tức</h2>
            <a
              href="/sforum"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
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
        </section>
      </div>
    </div>
  )
}
