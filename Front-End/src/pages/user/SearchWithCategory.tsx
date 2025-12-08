import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { categoryBrandService } from '@/services/categoryBrand.service';
import { productService } from '@/services/product.service';
import { filterCriteriaService } from '@/services/filterCriteria.service';
import { bannerService } from '@/services/banner.service';
import type { Brand } from '@/types/brand.type';
import type { Product } from '@/types/product.type';
import type { FilterCriteria } from '@/types/filterCriteria.type';
import type { BannerDisplayResponse } from '@/types/banner.type';
import Breadcrumb from '@/components/user/search/Breadcrumb';
import BrandSelection from '@/components/user/search/BrandSelection';
import FilterSection from '@/components/user/search/FilterSection';
import SortSection from '@/components/user/search/SortSection';
import ProductCard from '@/components/user/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@/hooks/useQuery';

interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  filterValues?: number[];
}

export default function SearchWithCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryName, setCategoryName] = useState<string>('');

  // Load brands using useQuery hook
  const { 
    data: brandsData, 
    isLoading: brandsLoading 
  } = useQuery<{ data: Brand[] }>(
    () => categoryBrandService.getBrandsByCategorySlug(slug!),
    {
      queryKey: ['brands', slug || ''],
      enabled: !!slug,
      onError: (err) => {
        console.error('Lỗi khi tải brands:', err);
      }
    }
  );

  // Load filter criteria using useQuery hook
  const { 
    data: filterCriteriaData, 
    isLoading: filterCriteriaLoading 
  } = useQuery<{ data: FilterCriteria[] }>(
    () => filterCriteriaService.getFilterCriteriaByCategorySlug(slug!),
    {
      queryKey: ['filter-criteria', slug || ''],
      enabled: !!slug,
      onError: (err) => {
        console.error('Lỗi khi tải filter criteria:', err);
      }
    }
  );

  const brands = brandsData?.data || [];
  const filterCriterias = filterCriteriaData?.data || [];
  const loading = brandsLoading || filterCriteriaLoading;

  const searchFilters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'size') {
        result[key] = value;
      }
    });
    // Add sortBy if not present, default to 'popular'
    if (!result.sortBy) {
      result.sortBy = 'popular';
    }
    return result;
  }, [searchParams]);
  
  const currentSort = (searchParams.get('sortBy') || 'popular') as 'popular' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc';

  const { 
    data: productsData, 
    isLoading: productsLoading
  } = useQuery<{ data: { data: Product[], totalPage: number, totalItem: number } }>(
    () => productService.searchProducts(slug!, 1, 12, searchFilters),
    {
      queryKey: ['search-products', slug || '', searchParams.toString()],
      enabled: !!slug,
      onError: (err) => {
        console.error('Lỗi khi tải products:', err);
      }
    }
  );

  const products = productsData?.data?.data || [];

  // Load banners using useQuery hook
  const {
    data: bannersData,
    isLoading: bannersLoading,
  } = useQuery<BannerDisplayResponse>(
    () => bannerService.getBannersToDisplay(),
    {
      queryKey: ['banners', 'display'],
    }
  );

  const banners = bannersData?.data || [];

  useEffect(() => {
    if (slug) {
      const name = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCategoryName(name);
    }
  }, [slug]);

  const parsedFiltersFromUrl = useMemo(() => {
    const parsedFilters: SearchFilters = {};
    
    const brandsParam = searchParams.get('brands');
    if (brandsParam && brands.length > 0) {
      const brandSlugs = brandsParam.split(',');
      parsedFilters.brands = brands
        .filter(b => brandSlugs.includes(b.slug))
        .map(b => b.id);
    }
    
    const inStockParam = searchParams.get('inStock');
    if (inStockParam === 'true') {
      parsedFilters.inStock = true;
    }
    
    const priceMinParam = searchParams.get('priceMin');
    const priceMaxParam = searchParams.get('priceMax');
    if (priceMinParam) parsedFilters.priceMin = Number(priceMinParam);
    if (priceMaxParam) parsedFilters.priceMax = Number(priceMaxParam);
    
    // Parse filter values
    const filterValuesParam = searchParams.get('filterValues');
    if (filterValuesParam) {
      const filterValueIds = filterValuesParam.split(',')
        .map(id => Number(id.trim()))
        .filter(id => !isNaN(id));
      if (filterValueIds.length > 0) {
        parsedFilters.filterValues = filterValueIds;
      }
    }
    
    return parsedFilters;
  }, [searchParams, brands]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.brands && newFilters.brands.length > 0) {
      const brandSlugs = brands
        .filter(b => newFilters.brands?.includes(b.id))
        .map(b => b.slug);
      if (brandSlugs.length > 0) {
        params.set('brands', brandSlugs.join(','));
      }
    }
    
    if (newFilters.inStock) {
      params.set('inStock', 'true');
    }
    
    if (newFilters.priceMin !== undefined) {
      params.set('priceMin', newFilters.priceMin.toString());
    }
    if (newFilters.priceMax !== undefined) {
      params.set('priceMax', newFilters.priceMax.toString());
    }
    
    if (newFilters.filterValues && newFilters.filterValues.length > 0) {
      params.set('filterValues', newFilters.filterValues.join(','));
    }
    
    // Preserve sortBy
    const sortBy = searchParams.get('sortBy') || 'popular';
    if (sortBy) {
      params.set('sortBy', sortBy);
    }
    
    setSearchParams(params);
  };
  
  const handleSortChange = (sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    params.set('page', '1'); // Reset to page 1 when sorting changes
    setSearchParams(params);
  };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: categoryName || 'Danh mục' },
          ]}
        />

        {/* Promotional Banners from API */}
        {bannersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {banners.slice(0, 2).map((banner) => (
              <a
                key={banner.id}
                href={banner.linkUrl || '#'}
                className="relative rounded-lg overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/avatar.jpg";
                  }}
                />
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      {banner.title && (
                        <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                      )}
                      {banner.description && (
                        <p className="text-sm opacity-90">{banner.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : null}

      <BrandSelection 
        brands={brands} 
        loading={loading}
        selectedBrands={parsedFiltersFromUrl.brands || []}
        onBrandChange={(brandIds) => {
          handleFilterChange({
            ...parsedFiltersFromUrl,
            brands: brandIds,
          });
        }}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : (
        <FilterSection 
          filterCriterias={filterCriterias} 
          loading={loading}
          filters={parsedFiltersFromUrl}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Kết quả tìm kiếm
            {products.length > 0 && (
              <span className="text-gray-500 text-lg ml-2">
                ({products.length} sản phẩm)
              </span>
            )}
          </h2>
        </div>
        
        <SortSection sortBy={currentSort} onSortChange={handleSortChange} />

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
