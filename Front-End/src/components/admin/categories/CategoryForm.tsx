import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, RotateCcw, Trash2 } from "lucide-react"
import type { Category, CreateCategoryRequest } from "@/types/category.type"

interface CategoryFormProps {
  category?: Category | null
  onSubmit: (data: CreateCategoryRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function CategoryForm({ category, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
    status: true,
    attributes: []
  })
  const [newAttribute, setNewAttribute] = useState("")
  const [allAttributes, setAllAttributes] = useState<Array<{id?: number, name: string, status: boolean}>>([])

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        attributes: category.attributes.filter(attr => attr.status).map(attr => ({ name: attr.name }))
      })
      setAllAttributes(category.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        status: attr.status
      })))
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addAttribute = () => {
    if (newAttribute.trim() && !allAttributes.some(attr => attr.name === newAttribute.trim())) {
      const newAttr = { name: newAttribute.trim(), status: true }
      setFormData(prev => ({
        ...prev,
        attributes: [...(prev.attributes || []), newAttr]
      }))
      setAllAttributes(prev => [...prev, { name: newAttribute.trim(), status: true }])
      setNewAttribute("")
    }
  }

  const removeAttribute = (index: number) => {
    const attributeToRemove = formData.attributes?.[index]
    if (attributeToRemove) {
      // Cập nhật status thành false trong allAttributes
      setAllAttributes(prev => prev.map(attr => 
        attr.name === attributeToRemove.name ? { ...attr, status: false } : attr
      ))
      
      // Xóa khỏi danh sách hiện tại
      setFormData(prev => ({
        ...prev,
        attributes: prev.attributes?.filter((_, i) => i !== index) || []
      }))
    }
  }

  const restoreAttribute = (attrName: string) => {
    // Cập nhật status thành true trong allAttributes
    setAllAttributes(prev => prev.map(attr => 
      attr.name === attrName ? { ...attr, status: true } : attr
    ))
    
    // Thêm lại vào danh sách attributes
    setFormData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { name: attrName }]
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAttribute()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium text-gray-700">
          Tên danh mục <span className="text-red-500">*</span>
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
        <Label htmlFor="description" className="text-right font-medium text-gray-700">
          Mô tả
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          disabled={isLoading}
        />
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
          Thuộc tính
        </Label>
        <div className="col-span-3 space-y-4">
          {/* Thêm thuộc tính mới */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Nhập tên thuộc tính..."
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addAttribute}
                disabled={!newAttribute.trim() || isLoading}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Thuộc tính đang hoạt động */}
            {formData.attributes && formData.attributes.length > 0 ? (
              <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-green-700">Thuộc tính đang hoạt động:</Label>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                    {formData.attributes.length} thuộc tính
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.attributes.map((attr, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1 bg-white text-green-700 border-green-300 shadow-sm">
                      <span>{attr.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="ml-1 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50"
                        disabled={isLoading}
                        title="Xóa mềm thuộc tính"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 text-center">Chưa có thuộc tính nào. Hãy thêm thuộc tính mới ở trên.</p>
              </div>
            )}
          </div>

          {/* Thuộc tính đã bị xóa mềm */}
          {allAttributes.filter(attr => !attr.status).length > 0 && (
            <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-orange-700">Thuộc tính đã xóa (có thể khôi phục):</Label>
                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                  {allAttributes.filter(attr => !attr.status).length} thuộc tính
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {allAttributes.filter(attr => !attr.status).map((attr, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1 bg-white text-gray-600 border-gray-300 line-through shadow-sm">
                    <span>{attr.name}</span>
                    <button
                      type="button"
                      onClick={() => restoreAttribute(attr.name)}
                      className="ml-1 hover:text-green-500 transition-colors p-0.5 rounded hover:bg-green-50"
                      disabled={isLoading}
                      title="Khôi phục thuộc tính"
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
          {isLoading ? "Đang xử lý..." : (category ? "Cập nhật" : "Thêm")}
        </Button>
      </div>
    </form>
  )
}
