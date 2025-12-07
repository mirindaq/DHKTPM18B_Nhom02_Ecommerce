import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import type {
  CreateArticleCategoryRequest,
  ArticleCategory,
} from "@/types/article-category.type";

export default function ArticleCategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: {
  category?: ArticleCategory | null;
  onSubmit: (data: CreateArticleCategoryRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [modifiedAt, setModifiedAt] = useState("");

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setSlug(category.slug || "");
      setImage(category.image || "");
      setImagePreview(category.image || "");
      setCreatedAt(category.createdAt || "");
      setModifiedAt(category.modifiedAt || "");
    } else {
      setTitle("");
      setSlug("");
      setImage("");
      setImagePreview("");
      setCreatedAt("");
      setModifiedAt("");
    }
  }, [category]);

//   const generateSlug = (text: string) => {
//   return text
//     .toLowerCase()
//     .replace(/đ/g, "d") 
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "") 
//     .replace(/[^a-z0-9]+/g, "-") 
//     .replace(/^-+|-+$/g, ""); 
// };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = image;

    // Upload image if new file selected
    if (imageFile) {
      try {
        setUploadingImage(true);
        const uploadResponse = await uploadService.uploadImage([imageFile]);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalImageUrl = uploadResponse.data[0];
        } else {
          toast.error("Không thể tải ảnh lên");
          setUploadingImage(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Không thể tải ảnh lên");
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const payload: CreateArticleCategoryRequest = {
      title,
      image: finalImageUrl,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right font-medium text-gray-700">
          Tiêu đề 
        </Label>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          disabled={isLoading}
          className="col-span-3"
        />
      </div>

      {/* Image */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Ảnh
        </Label>
        <div className="col-span-3 space-y-2">
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveImage}
                disabled={isLoading || uploadingImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading || uploadingImage}
                className="flex-1"
              />
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Slug */}
      
      {slug && (
        <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Slug</Label>
        <Input
          value={slug}
          readOnly
          className="col-span-3 bg-gray-100 cursor-not-allowed"
        />
      </div>
      )}

      {/* CreatedAt */}
      {createdAt && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Ngày tạo</Label>
          <Input
            value={new Date(createdAt).toLocaleString()}
            readOnly
            className="col-span-3 bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}

      {/* ModifiedAt */}
      {modifiedAt && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Ngày cập nhật</Label>
          <Input
            value={new Date(modifiedAt).toLocaleString()}
            readOnly
            className="col-span-3 bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || uploadingImage}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading || uploadingImage}>
          {uploadingImage ? "Đang tải ảnh..." : category ? "Cập nhật" : "Thêm"}
        </Button>
      </div>
    </form>
  );
}
