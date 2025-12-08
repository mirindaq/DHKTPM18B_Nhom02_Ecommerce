import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CustomBadge } from "@/components/ui/CustomBadge"
import { Plus, RotateCcw, Trash2, X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadService } from "@/services/upload.service"
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
    image: "",
    status: true,
    attributes: []
  })
  const [newAttribute, setNewAttribute] = useState("")
  const [allAttributes, setAllAttributes] = useState<Array<{ id?: number, name: string, status: boolean }>>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        image: category.image || "",
        status: category.status,
        attributes: category.attributes.filter(attr => attr.status).map(attr => ({ name: attr.name }))
      })
      setPreviewUrl(category.image || "")
      setAllAttributes(category.attributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        status: attr.status
      })))
    }
  }, [category])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setFormData(prev => ({ ...prev, image: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let finalImageUrl = formData.image

      // Nếu có file mới được chọn, upload trước
      if (selectedFile) {
        setIsUploading(true)
        const uploadResponse = await uploadService.uploadImage([selectedFile])
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalImageUrl = uploadResponse.data[0]
        } else {
          toast.error("Không thể upload hình ảnh")
          return
        }
        setIsUploading(false)
      }

      // Gửi dữ liệu với URL hình ảnh
      const submitData = {
        ...formData,
        image: finalImageUrl
      }

      onSubmit(submitData)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Có lỗi xảy ra khi upload hình ảnh")
      setIsUploading(false)
    }
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
          disabled={isLoading || isUploading}
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
          disabled={isLoading || isUploading}
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
            disabled={isLoading || isUploading}
          />
          <Label htmlFor="status" className="text-sm text-gray-600">
            {formData.status ? "Hoạt động" : "Không hoạt động"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Hình ảnh
        </Label>
        <div className="col-span-3 space-y-3">
          <div className="flex items-center space-x-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('category-image-upload')?.click()}
              disabled={isLoading || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Chọn ảnh
            </Button>
          </div>

          {previewUrl && (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 border-0"
                disabled={isLoading || isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <input
            id="category-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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
                disabled={isLoading || isUploading}
              />
              <Button
                type="button"
                onClick={addAttribute}
                disabled={!newAttribute.trim() || isLoading || isUploading}
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
                  <CustomBadge variant="success" size="sm">
                    {formData.attributes.length} thuộc tính
                  </CustomBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.attributes.map((attr, index) => (
                    <CustomBadge key={index} variant="success" className="flex items-center space-x-1 bg-white shadow-sm">
                      <span>{attr.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="ml-1 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50"
                        disabled={isLoading || isUploading}
                        title="Xóa mềm thuộc tính"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </CustomBadge>
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
                <CustomBadge variant="warning" size="sm">
                  {allAttributes.filter(attr => !attr.status).length} thuộc tính
                </CustomBadge>
              </div>
              <div className="flex flex-wrap gap-2">
                {allAttributes.filter(attr => !attr.status).map((attr, index) => (
                  <CustomBadge key={index} variant="secondary" className="flex items-center space-x-1 bg-white line-through shadow-sm">
                    <span>{attr.name}</span>
                    <button
                      type="button"
                      onClick={() => restoreAttribute(attr.name)}
                      className="ml-1 hover:text-green-500 transition-colors p-0.5 rounded hover:bg-green-50"
                      disabled={isLoading || isUploading}
                      title="Khôi phục thuộc tính"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </CustomBadge>
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
          disabled={isLoading || isUploading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            category ? "Cập nhật" : "Thêm"
          )}
        </Button>
      </div>
    </form>
  )
}
