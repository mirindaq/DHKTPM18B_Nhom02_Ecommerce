import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RotateCcw, Trash2 } from "lucide-react"
import { useQuery } from "@/hooks"
import { categoryService } from "@/services/category.service"
import type { Variant, CreateVariantRequest } from "@/types/variant.type"
import type { CategoryListResponse } from "@/types/category.type"

interface VariantFormProps {
  variant?: Variant | null
  onSubmit: (data: CreateVariantRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function VariantForm({ variant, onSubmit, onCancel, isLoading }: VariantFormProps) {
  const [formData, setFormData] = useState<CreateVariantRequest>({
    name: "",
    status: true,
    categoryId: undefined,
    variantValues: []
  })
  const [newVariantValue, setNewVariantValue] = useState("")
  const [allVariantValues, setAllVariantValues] = useState<Array<{id?: number, value: string, status: boolean}>>([])

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories
  } = useQuery<CategoryListResponse>(
    () => categoryService.getCategories(1, 100, ""),
    {
      queryKey: ['categories-for-variant'],
    }
  )

  const categories = categoriesData?.data?.data || []

  useEffect(() => {
    if (variant) {
      // Chỉ lấy những variant values có status: true cho formData
      const activeVariantValues = variant.variantValues.filter(value => value.status)
      setFormData({
        name: variant.name,
        status: variant.status,
        categoryId: variant.category?.id,
        variantValues: activeVariantValues.map(value => ({ value: value.value }))
      })
      // Lưu tất cả variant values (cả active và inactive) để quản lý
      setAllVariantValues(variant.variantValues.map(value => ({
        id: value.id,
        value: value.value,
        status: value.status
      })))
    } else {
      // Reset form when no variant (creating new)
      setFormData({
        name: "",
        status: true,
        categoryId: undefined,
        variantValues: []
      })
      setAllVariantValues([])
    }
  }, [variant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục")
      return
    }
    
    onSubmit(formData)
  }

  const addVariantValue = () => {
    if (newVariantValue.trim() && !allVariantValues.some(val => val.value === newVariantValue.trim())) {
      const newValue = { value: newVariantValue.trim() }
      setFormData(prev => ({
        ...prev,
        variantValues: [...(prev.variantValues || []), newValue]
      }))
      setAllVariantValues(prev => [...prev, { value: newVariantValue.trim(), status: true }])
      setNewVariantValue("")
    }
  }

  const removeVariantValue = (index: number) => {
    const valueToRemove = formData.variantValues?.[index]
    if (valueToRemove) {
      // Cập nhật status thành false trong allVariantValues
      setAllVariantValues(prev => prev.map(val => 
        val.value === valueToRemove.value ? { ...val, status: false } : val
      ))
      
      // Xóa khỏi danh sách hiện tại
      setFormData(prev => ({
        ...prev,
        variantValues: prev.variantValues?.filter((_, i) => i !== index) || []
      }))
    }
  }

  const restoreVariantValue = (valueName: string) => {
    // Cập nhật status thành true trong allVariantValues
    setAllVariantValues(prev => prev.map(val => 
      val.value === valueName ? { ...val, status: true } : val
    ))
    
    // Thêm lại vào danh sách variantValues (chỉ nếu chưa có)
    setFormData(prev => {
      const existingValues = prev.variantValues || []
      const alreadyExists = existingValues.some(val => val.value === valueName)
      if (!alreadyExists) {
        return {
          ...prev,
          variantValues: [...existingValues, { value: valueName }]
        }
      }
      return prev
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addVariantValue()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium text-gray-700">
          Tên variant <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right font-medium text-gray-700">
          Danh mục <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <Select
            value={formData.categoryId?.toString() || ""}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
            disabled={isLoading || isLoadingCategories}
          >
            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Chọn danh mục..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right font-medium text-gray-700">
          Trạng thái
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
            disabled={isLoading}
          />
          <Label htmlFor="status" className="text-sm text-gray-600">
            {formData.status ? "Hoạt động" : "Không hoạt động"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Giá trị variant
        </Label>
        <div className="col-span-3 space-y-4">
          {/* Thêm giá trị variant mới */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Nhập giá trị variant..."
                value={newVariantValue}
                onChange={(e) => setNewVariantValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addVariantValue}
                disabled={!newVariantValue.trim() || isLoading}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Giá trị variant đang hoạt động */}
            {formData.variantValues && formData.variantValues.length > 0 ? (
              <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-green-700">Giá trị variant đang hoạt động:</Label>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                    {formData.variantValues.length} giá trị
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.variantValues.map((value, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1 bg-white text-green-700 border-green-300 shadow-sm">
                      <span>{value.value}</span>
                      <button
                        type="button"
                        onClick={() => removeVariantValue(index)}
                        className="ml-1 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50"
                        disabled={isLoading}
                        title="Xóa mềm giá trị variant"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 text-center">Chưa có giá trị variant nào. Hãy thêm giá trị variant mới ở trên.</p>
              </div>
            )}
          </div>

          {/* Giá trị variant đã bị xóa mềm */}
          {allVariantValues.filter(val => !val.status).length > 0 && (
            <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-orange-700">Giá trị variant đã xóa (có thể khôi phục):</Label>
                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                  {allVariantValues.filter(val => !val.status).length} giá trị
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {allVariantValues.filter(val => !val.status).map((val, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1 bg-white text-gray-600 border-gray-300 line-through shadow-sm">
                    <span>{val.value}</span>
                    <button
                      type="button"
                      onClick={() => restoreVariantValue(val.value)}
                      className="ml-1 hover:text-green-500 transition-colors p-0.5 rounded hover:bg-green-50"
                      disabled={isLoading}
                      title="Khôi phục giá trị variant"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? "Đang xử lý..." : (variant ? "Cập nhật" : "Thêm")}
        </Button>
      </div>
    </form>
  )
}
