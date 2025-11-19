import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { categoryBrandService } from '@/services/categoryBrand.service';
import { variantService } from '@/services/variant.service';
import { productService } from '@/services/product.service';
import type { Brand } from '@/types/brand.type';
import type { Variant } from '@/types/variant.type';
import type { Product } from '@/types/product.type';
import Breadcrumb from '@/components/user/search/Breadcrumb';
import PromotionalBanners from '@/components/user/search/PromotionalBanners';
import BrandSelection from '@/components/user/search/BrandSelection';
import FilterSection from '@/components/user/search/FilterSection';
import ProductCard from '@/components/user/ProductCard';
import { useQuery } from '@/hooks/useQuery';

interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  variants?: { [variantId: number]: number[] };
}

export default function Search() {
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

  // Load variants using useQuery hook
  const { 
    data: variantsData, 
    isLoading: variantsLoading 
  } = useQuery<{ data: Variant[] }>(
    () => variantService.getVariantsByCategorySlug(slug!),
    {
      queryKey: ['variants', slug || ''],
      enabled: !!slug,
      onError: (err) => {
        console.error('Lỗi khi tải variants:', err);
      }
    }
  );

  const brands = brandsData?.data || [];
  const variants = variantsData?.data || [];
  const loading = brandsLoading || variantsLoading;

  const searchFilters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'size') {
        result[key] = value;
      }
    });
    return result;
  }, [searchParams]);

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
    
    const variantsObj: { [variantId: number]: number[] } = {};
    variants.forEach((variant) => {
      const paramValue = searchParams.get(variant.slug);
      if (paramValue && variant.variantValues) {
        const valueSlugs = paramValue.split(',');
        const valueIds = variant.variantValues
          .filter(vv => valueSlugs.includes(vv.slug))
          .map(vv => vv.id);
        if (valueIds.length > 0) {
          variantsObj[variant.id] = valueIds;
        }
      }
    });
    if (Object.keys(variantsObj).length > 0) {
      parsedFilters.variants = variantsObj;
    }
    
    return parsedFilters;
  }, [searchParams, brands, variants]);

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
    
    if (newFilters.variants) {
      Object.entries(newFilters.variants).forEach(([variantId, valueIds]) => {
        const variant = variants.find(v => v.id === Number(variantId));
        if (variant && valueIds.length > 0 && variant.variantValues) {
          const valueSlugs = variant.variantValues
            .filter(vv => valueIds.includes(vv.id))
            .map(vv => vv.slug);
          if (valueSlugs.length > 0) {
            params.set(variant.slug, valueSlugs.join(','));
          }
        }
      });
    }
    
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb
        items={[
          { label: 'Điện thoại', href: '/products' },
          { label: categoryName || 'Danh mục' },
        ]}
      />

      <PromotionalBanners />

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
          variants={variants} 
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

        {productsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
