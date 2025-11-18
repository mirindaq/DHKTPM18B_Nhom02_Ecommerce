import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { categoryBrandService } from '@/services/categoryBrand.service';
import { variantService } from '@/services/variant.service';
import type { Brand } from '@/types/brand.type';
import type { Variant } from '@/types/variant.type';
import Breadcrumb from '@/components/user/search/Breadcrumb';
import PromotionalBanners from '@/components/user/search/PromotionalBanners';
import BrandSelection from '@/components/user/search/BrandSelection';
import FilterSection from '@/components/user/search/FilterSection';

export default function Search() {
  const { slug } = useParams<{ slug: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    if (slug) {
      loadData(slug);
    }
  }, [slug]);

  const loadData = async (categorySlug: string) => {
    try {
      setLoading(true);
      
      // Load brands and variants in parallel
      const [brandsResponse, variantsResponse] = await Promise.all([
        categoryBrandService.getBrandsByCategorySlug(categorySlug),
        variantService.getVariantsByCategorySlug(categorySlug),
      ]);

      setBrands(brandsResponse.data || []);
      setVariants(variantsResponse.data || []);
      
      // Extract category name from slug (convert slug to readable name)
      const name = categorySlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCategoryName(name);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setBrands([]);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Điện thoại', href: '/products' },
          { label: categoryName || 'Danh mục' },
        ]}
      />

      {/* Promotional Banners */}
      <PromotionalBanners />

      {/* Brand Selection */}
      <BrandSelection brands={brands} loading={loading} />

      {/* Filter Section - Variants */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : (
        <FilterSection variants={variants} loading={loading} />
      )}
    </div>
  );
}
