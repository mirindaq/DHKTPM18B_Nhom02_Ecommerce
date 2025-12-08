import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomBadge } from "@/components/ui/CustomBadge"
import { Loader2, Plus, X } from "lucide-react"
import { useQuery } from "@/hooks"
import { categoryService } from "@/services/category.service"
import type { Category } from "@/types/category.type"
import type { FilterCriteria, CreateFilterCriteriaRequest } from "@/types/filterCriteria.type"

interface FilterCriteriaFormProps {
  filterCriteria?: FilterCriteria | null
  categoryId?: number
  onSubmit: (data: CreateFilterCriteriaRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function FilterCriteriaForm({ 
  filterCriteria, 
  categoryId,
  onSubmit, 
  onCancel, 
  isLoading 
}: FilterCriteriaFormProps) {
  const [formData, setFormData] = useState<CreateFilterCriteriaRequest>({
    name: "",
    categoryId: 0,
    values: []
  })
  const [newValue, setNewValue] = useState("")

  const { data: categoriesData } = useQuery(
    () => categoryService.getAllCategoriesSimple(),
    { queryKey: ["categories-simple"] }
  )

  const categories = categoriesData?.data?.data || []

  useEffect(() => {
    if (filterCriteria) {
      setFormData({
        name: filterCriteria.name,
        categoryId: filterCriteria.categoryId,
        values: filterCriteria.filterValues?.map(fv => fv.value) || []
      })
    } else {
      setFormData({
        name: "",
        categoryId: categoryId || 0,
        values: []
      })
    }
  }, [filterCriteria, categoryId])

  const handleAddValue = () => {
    if (newValue.trim()) {
      setFormData(prev => ({
        ...prev,
        values: [...(prev.values || []), newValue.trim()]
      }))
      setNewValue("")
    }
  }

  const handleRemoveValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      return
    }
    if (!formData.categoryId) {
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium text-gray-700">
          Tên tiêu chí <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isLoading}
          placeholder="Ví dụ: Màu sắc, Kích thước, Chất liệu..."
        />
      </div>

      {categoryId && !filterCriteria && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right font-medium text-gray-700">
            Danh mục
          </Label>
          <div className="col-span-3">
            <Input
              id="category"
              value={categories.find((c: Category) => c.id === categoryId)?.name || `ID: ${categoryId}`}
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              Danh mục đã được chọn từ trang chính
            </p>
          </div>
        </div>
      )}
      {!categoryId && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right font-medium text-gray-700">
            Danh mục <span className="text-red-500">*</span>
          </Label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
            className="col-span-3 h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            required
            disabled={isLoading}
          >
            <option value={0}>Chọn danh mục</option>
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Giá trị tiêu chí
        </Label>
        <div className="col-span-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddValue()
                }
              }}
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập giá trị và nhấn Enter hoặc nút Thêm"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddValue}
              disabled={isLoading || !newValue.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm
            </Button>
          </div>
          
          {formData.values && formData.values.length > 0 && (
            <div className="flex flex-wrap gap-2.5 p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white min-h-[80px]">
              {formData.values.map((value, index) => (
                <CustomBadge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 border-gray-300 px-3 py-1.5 text-sm font-medium inline-flex items-center gap-2"
                >
                  <span>{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(index)}
                    className="ml-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors -mr-1"
                    disabled={isLoading}
                    title="Xóa giá trị này"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </CustomBadge>
              ))}
            </div>
          )}
          
          {(!formData.values || formData.values.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">
                Chưa có giá trị nào. Bạn có thể thêm sau bằng cách sử dụng chức năng "Quản lý giá trị".
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Thêm"
          )}
        </Button>
      </div>
    </form>
  )
}

