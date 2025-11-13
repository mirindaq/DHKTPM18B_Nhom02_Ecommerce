import { useState, useEffect } from 'react'
import { brandService } from '@/services/brand.service'
import { Loader2 } from 'lucide-react'
import type { Brand } from '@/types/brand.type'

interface BrandSectionProps {
  selectedBrand?: number | null
  onBrandSelect: (brandId: number | null) => void
}

export default function BrandSection({ selectedBrand, onBrandSelect }: BrandSectionProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true)
        const response = await brandService.getBrands(1, 20, '')
        setBrands(response.data.data)
      } catch (error) {
        console.error('Lỗi khi tải thương hiệu:', error)
      } finally {
        setLoading(false)
      }
    }
    loadBrands()
  }, [])

  const handleBrandClick = (brandId: number) => {
    if (selectedBrand === brandId) {
      onBrandSelect(null)
    } else {
      onBrandSelect(brandId)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Thương hiệu</h2>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center w-full py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <button
              onClick={() => onBrandSelect(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBrand === null
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tất cả
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.id)}
                className={`flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBrand === brand.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {brand.image && (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-5 h-5 rounded object-contain"
                  />
                )}
                <span>{brand.name}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

