import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Brand } from '@/types/brand.type';

interface BrandSelectionProps {
  brands: Brand[];
  loading?: boolean;
}

export default function BrandSelection({ brands, loading }: BrandSelectionProps) {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

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

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Thương hiệu</h2>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <Button
            key={brand.id}
            variant="outline"
            onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
            className="border-gray-300 h-15 w-30 flex items-center justify-center"
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
        ))}
      </div>
    </div>
  );
}

