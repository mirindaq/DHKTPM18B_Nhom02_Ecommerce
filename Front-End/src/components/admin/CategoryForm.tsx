import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Category, CreateCategoryRequest, Attribute, CreateAttributeRequest } from "@/types/category.type"

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

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        attributes: category.attributes.map(attr => ({ name: attr.name }))
      })
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addAttribute = () => {
    if (newAttribute.trim() && !formData.attributes?.some(attr => attr.name === newAttribute.trim())) {
      setFormData(prev => ({
        ...prev,
        attributes: [...(prev.attributes || []), { name: newAttribute.trim() }]
      }))
      setNewAttribute("")
    }
  }

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index) || []
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
        <div className="col-span-3 space-y-3">
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
          
          {formData.attributes && formData.attributes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.attributes.map((attr, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{attr.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="ml-1 hover:text-red-500"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
