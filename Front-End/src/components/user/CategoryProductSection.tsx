import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { productService } from '@/services/product.service'
import { categoryBrandService } from '@/services/categoryBrand.service'
import ProductCard from '@/components/user/ProductCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import type { Product } from '@/types/product.type'
import type { Brand } from '@/types/brand.type'
import type { Category } from '@/types/category.type'

interface CategoryProductSectionProps {
  category: Category
  sideBanners?: {
    image: string
    link?: string
    title?: string
    subtitle?: string
    buttonText?: string
    gradient?: string
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

  // Default side banners with images - chỉ 2 banner
  const defaultBanners = [
    {
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:795/q:90/plain/https://media-asset.cellphones.com.vn/page_configs/01KAT2MC172RE7DNF84QSF6PFP.png',
      link: '/search/laptop',
      title: '',
      subtitle: '',
      buttonText: '',
      gradient: ''
    },
    {
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:321:795/q:90/plain/https://media-asset.cellphones.com.vn/page_configs/01K8AK76MB2NCC8QHS16T26ES2.png',
      link: '/search/phone',
      title: '',
      subtitle: '',
      buttonText: '',
      gradient: ''
    }
  ]

  const banners = (sideBanners || defaultBanners).slice(0, 2)

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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Side Banners - Smaller Width */}
          <div className="hidden lg:flex lg:flex-col w-[200px] flex-shrink-0 border-r border-gray-200">
            {banners.map((banner, index) => (
              <Link
                key={index}
                to={banner.link || '#'}
                className={`flex-1 overflow-hidden group hover:opacity-90 transition-opacity duration-300 ${
                  index === 0 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="w-full h-full p-2">
                  <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 group-hover:border-red-300 transition-colors">
                    <img
                      src={banner.image}
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/avatar.jpg";
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Category Name Header - Centered */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <Link 
                  to={`/search/${category.slug}`}
                  className="text-xl font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  {category.name.toUpperCase()}
                </Link>
              </div>
            </div>

            {/* Brand Tabs */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-shrink-0 rounded-full "
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
                    className="flex-shrink-0 rounded-full border-gray-300 bg-white hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    asChild
                  >
                    <Link to={`/search/${category.slug}?brands=${brand.slug || brand.name.toLowerCase()}`}>
                      {brand.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-6">
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
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 text-center mb-4">Không có sản phẩm nào trong danh mục này</p>
                  <Button variant="outline" asChild>
                    <Link to={`/search/${category.slug}`}>
                      Khám phá danh mục
                    </Link>
                  </Button>
                </div>
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
      </div>
    </section>
  )
}


