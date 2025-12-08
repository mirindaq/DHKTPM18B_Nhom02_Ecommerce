import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { productService } from '@/services/product.service'
import { categoryBrandService } from '@/services/categoryBrand.service'
import ProductCard from '@/components/user/ProductCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import type { Product } from '@/types/product.type'
import type { Brand } from '@/types/brand.type'
import type { Category } from '@/types/category.type'

interface CategoryProductSectionProps {
  category: Category
  sideBanners?: {
    image: string
    title: string
    subtitle: string
    buttonText: string
    gradient: string
  }[]
}

export default function CategoryProductSection({ category, sideBanners }: CategoryProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch brands by category
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await categoryBrandService.getBrandsByCategorySlug(category.slug)
        setBrands(response.data || [])
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }
    if (category.slug) {
      fetchBrands()
    }
  }, [category.slug])

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productService.getProducts(1, 8, {
          categoryId: category.id,
        })
        setProducts(response.data?.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category.id])

  // Default side banners if not provided
  const defaultBanners = [
    {
      image: '',
      title: category.name,
      subtitle: 'Giảm đến 30%',
      buttonText: 'MUA NGAY',
      gradient: 'from-blue-600 via-blue-700 to-indigo-800'
    },
    {
      image: '',
      title: 'Ưu đãi HOT',
      subtitle: 'S-Student giảm thêm',
      buttonText: 'XEM NGAY',
      gradient: 'from-purple-600 via-purple-700 to-pink-600'
    }
  ]

  const banners = sideBanners || defaultBanners

  // Loading skeleton
  const ProductSkeleton = () => (
    <div className="overflow-hidden bg-white rounded-xl border border-gray-200">
      <Skeleton className="aspect-[5/4] w-full" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex items-center">
            <Link 
              to={`/search/${category.slug}`}
              className="px-6 py-4 text-lg font-bold text-red-600 border-b-2 border-red-600 bg-white hover:bg-gray-50 transition-colors"
            >
              {category.name.toUpperCase()}
            </Link>
            <div className="flex-1" />
          </div>
        </div>

        <div className="flex">
          {/* Side Banners */}
          <div className="hidden lg:block w-[200px] flex-shrink-0 p-3 space-y-3">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`relative h-[280px] rounded-xl bg-gradient-to-b ${banner.gradient} p-4 text-white overflow-hidden cursor-pointer group`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium opacity-90">{banner.subtitle}</h3>
                    <h2 className="text-xl font-bold mt-1 leading-tight">{banner.title}</h2>
                  </div>
                  <button className="mt-auto bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                    {banner.buttonText}
                  </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -top-5 -left-5 w-20 h-20 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4">
            {/* Brand Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant="default"
                size="sm"
                className="flex-shrink-0 rounded-full bg-gray-900 text-white hover:bg-gray-800"
                asChild
              >
                <Link to={`/search/${category.slug}`}>
                  Tất cả
                </Link>
              </Button>
              
              {brands.slice(0, 10).map((brand) => (
                <Button
                  key={brand.id}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 rounded-full border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  asChild
                >
                  <Link to={`/search/${category.slug}?brands=${brand.slug || brand.name.toLowerCase()}`}>
                    {brand.name}
                  </Link>
                </Button>
              ))}
              
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 text-center">Không có sản phẩm nào trong danh mục này</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to={`/search/${category.slug}`}>
                      Khám phá danh mục
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* View All Button */}
            {products.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="px-8 py-2 rounded-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
                  asChild
                >
                  <Link to={`/search/${category.slug}`}>
                    Xem tất cả {category.name}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}


