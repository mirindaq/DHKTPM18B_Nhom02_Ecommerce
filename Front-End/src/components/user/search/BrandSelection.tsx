import { Button } from '@/components/ui/button';
import type { Brand } from '@/types/brand.type';

interface BrandSelectionProps {
  brands: Brand[];
  loading?: boolean;
  selectedBrands?: number[];
  onBrandChange?: (brandIds: number[]) => void;
}

export default function BrandSelection({ 
  brands, 
  loading,
  selectedBrands = [],
  onBrandChange 
}: BrandSelectionProps) {

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Thương hiệu</h2>
        <div className="flex flex-wrap gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 w-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  const handleBrandClick = (brandId: number) => {
    let newSelectedBrands: number[];
    
    if (selectedBrands.includes(brandId)) {
      newSelectedBrands = selectedBrands.filter(id => id !== brandId);
    } else {
      newSelectedBrands = [...selectedBrands, brandId];
    }
    
    if (onBrandChange) {
      onBrandChange(newSelectedBrands);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Thương hiệu</h2>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => {
          const isSelected = selectedBrands.includes(brand.id);
          return (
            <Button
              key={brand.id}
              variant="outline"
              onClick={() => handleBrandClick(brand.id)}
              className={`h-15 w-30 flex items-center justify-center transition-all ${
                isSelected 
                  ? 'border-red-600 bg-red-50 ring-2 ring-red-200' 
                  : 'border-gray-300 hover:border-red-600'
              }`}
            >
              {brand.image && (
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

