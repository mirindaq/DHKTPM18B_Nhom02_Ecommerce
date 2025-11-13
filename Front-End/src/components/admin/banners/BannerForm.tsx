import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadService } from "@/services/upload.service"
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from "@/types/banner.type"

interface BannerFormProps {
  banner?: Banner | null
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function BannerForm({ banner, onSubmit, onCancel, isLoading }: BannerFormProps) {
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: "",
    imageUrl: "",
    description: "",
    linkUrl: "",
    isActive: true,
    startDate: "",
    endDate: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        description: banner.description,
        linkUrl: banner.linkUrl,
        isActive: banner.isActive,
        startDate: banner.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: banner.endDate.split('T')[0]
      })
      setPreviewUrl(banner.imageUrl)
    } else {
      // Set default dates
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthStr = nextMonth.toISOString().split('T')[0]
      
      setFormData(prev => ({
        ...prev,
        startDate: today,
        endDate: nextMonthStr
      }))
    }
  }, [banner])

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
    setFormData(prev => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let finalImageUrl = formData.imageUrl

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

      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (endDate <= startDate) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu")
        return
      }

      // Gửi dữ liệu với URL hình ảnh
      if (banner) {
        // Update request doesn't need staffId
        const updateData: UpdateBannerRequest = {
          title: formData.title,
          imageUrl: finalImageUrl,
          description: formData.description,
          linkUrl: formData.linkUrl,
          isActive: formData.isActive,
          startDate: formData.startDate,
          endDate: formData.endDate
        }
        onSubmit(updateData)
      } else {
        // Create request
        const createData: CreateBannerRequest = {
          ...formData,
          imageUrl: finalImageUrl
        }
        onSubmit(createData)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Có lỗi xảy ra khi upload hình ảnh")
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right font-medium text-gray-700">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isLoading || isUploading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="linkUrl" className="text-right font-medium text-gray-700">
          Link URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="linkUrl"
          type="url"
          value={formData.linkUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isLoading || isUploading}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right font-medium text-gray-700">
          Mô tả <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          required
          maxLength={500}
          disabled={isLoading || isUploading}
        />
        <div className="col-span-3 col-start-2 text-sm text-gray-500">
          {formData.description.length}/500 ký tự
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right font-medium text-gray-700">
          Ngày bắt đầu <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <DatePicker
            id="startDate"
            value={formData.startDate}
            onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
            placeholder="Chọn ngày bắt đầu"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endDate" className="text-right font-medium text-gray-700">
          Ngày kết thúc <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <DatePicker
            id="endDate"
            value={formData.endDate}
            onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
            placeholder="Chọn ngày kết thúc"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isActive" className="text-right font-medium text-gray-700">
          Trạng thái
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            disabled={isLoading || isUploading}
          />
          <Label htmlFor="isActive" className="text-sm text-gray-600">
            {formData.isActive ? "Hoạt động" : "Không hoạt động"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Hình ảnh <span className="text-red-500">*</span>
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
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            banner ? "Cập nhật" : "Thêm"
          )}
        </Button>
      </div>
    </form>
  )
}

