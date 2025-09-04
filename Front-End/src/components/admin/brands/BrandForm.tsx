import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadService } from "@/services/upload.service"
import type { Brand, CreateBrandRequest } from "@/types/brand.type"

interface BrandFormProps {
  brand?: Brand | null
  onSubmit: (data: CreateBrandRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function BrandForm({ brand, onSubmit, onCancel, isLoading }: BrandFormProps) {
  const [formData, setFormData] = useState<CreateBrandRequest>({
    name: "",
    description: "",
    image: "",
    origin: "",
    status: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || "",
        image: brand.image,
        origin: brand.origin,
        status: brand.status
      })
      setPreviewUrl(brand.image)
    }
  }, [brand])

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium text-gray-700">
          Tên thương hiệu <span className="text-red-500">*</span>
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
        <Label htmlFor="origin" className="text-right font-medium text-gray-700">
          Xuất xứ <span className="text-red-500">*</span>
        </Label>
        <Input
          id="origin"
          value={formData.origin}
          onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
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
              onClick={() => document.getElementById('image-upload')?.click()}
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
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            brand ? "Cập nhật" : "Thêm"
          )}
        </Button>
      </div>
    </form>
  )
}
