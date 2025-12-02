import { useState, useEffect } from 'react'
import { categoryService } from '@/services/category.service'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/types/category.type'

interface CategorySectionProps {
  selectedCategory?: number | null
  onCategorySelect: (categoryId: number | null) => void
}

export default function CategorySection({ selectedCategory, onCategorySelect }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const response = await categoryService.getCategories(1, 12, '')
        setCategories(response.data.data)
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId)
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
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Danh mục sản phẩm</h2>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center w-full py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <button
              onClick={() => onCategorySelect(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span>{category.name}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

