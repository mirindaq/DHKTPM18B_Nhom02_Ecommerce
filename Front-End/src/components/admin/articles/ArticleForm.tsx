import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { uploadService } from "@/services/upload.service";
import type { Article, CreateArticleRequest } from "@/types/article.type";
import type {
  ArticleCategoryListResponse,
  ArticleCategory,
} from "@/types/article-category.type";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Quill from "quill";
import FileUpload from "@/components/ui/FileUpload";
import { articleCategoryService } from "@/services/article-category.service";
import { useQuery } from "@/hooks";

interface Props {
  article?: Article | null;
  categories?: ArticleCategory[];
  onSubmit: (data: CreateArticleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ArticleForm({
  article,
  categories: _externalCategories,
  onSubmit,
  onCancel,
  isLoading,
}: Props) {
  const quillRef = useRef<Quill | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedThumbnailFile, setSelectedThumbnailFile] =
    useState<File | null>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string>("");

  const [formData, setFormData] = useState<CreateArticleRequest>({
    title: "",
    thumbnail: "",
    status: true,
    articleCategoryId: 0,
    content: "",
  });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useQuery<ArticleCategoryListResponse>(
      () => articleCategoryService.getCategories(1, 9999, ""),

      {
        queryKey: ["categories"],
      }
    );

  const categories = categoriesData?.data?.data || [];

  // Nếu có dữ liệu bài viết -> nạp vào formData
  useEffect(() => {
    if (!categories.length) return;

    if (article) {
      setFormData((prev) => ({
        ...prev,
        title: article.title,
        thumbnail: article.thumbnail || "",
        status: Boolean(article.status),
        articleCategoryId: article.category?.id || 0,
        content: article.content || "",
      }));
      setPreviewThumbnailUrl(article.thumbnail || "");
    } else {
      setFormData((prev) => ({
        ...prev,
        articleCategoryId: 0,
      }));
    }
  }, [categories, article]);

  // Khi chọn file thumbnail
  const handleThumbnailFiles = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedThumbnailFile(file);
      setPreviewThumbnailUrl(URL.createObjectURL(file));
    } else {
      setSelectedThumbnailFile(null);
      setPreviewThumbnailUrl("");
    }
  };

  // Xóa hình
  const removeThumbnail = () => {
    setSelectedThumbnailFile(null);
    setPreviewThumbnailUrl("");
    setFormData((prev) => ({ ...prev, thumbnail: "" }));
  };

  // Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.articleCategoryId) return;

    let thumbnailUrl = formData.thumbnail;

    if (selectedThumbnailFile) {
      try {
        setIsUploading(true);
        const response = await uploadService.uploadImage([
          selectedThumbnailFile,
        ]);
        const url = response?.data?.[0];
        if (url) thumbnailUrl = url;
      } catch (error) {
        console.error("Upload ảnh thất bại:", error);
      } finally {
        setIsUploading(false);
      }
    }

    const content = quillRef.current?.root.innerHTML || "";

    const payload: CreateArticleRequest = {
      ...formData,
      title: formData.title.trim(),
      thumbnail: thumbnailUrl ?? "",
      content,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- THÔNG TIN CƠ BẢN --- */}
        <div className="p-4 border rounded-xl bg-white shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-3">Thông tin cơ bản</h2>

          {/* Tiêu đề */}
          <div>
            <Label className="font-medium mb-2">Tiêu đề</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Nhập tiêu đề bài viết"
              required
              disabled={isLoading}
            />
          </div>

          {/* Danh mục + Trạng thái */}
          <div className="grid grid-cols-2 gap-4 items-center mt-5">
            {/* Danh mục */}
            <div>
              <Label className="font-medium mb-2">Danh mục</Label>
              <Select
                value={
                  formData.articleCategoryId
                    ? String(formData.articleCategoryId)
                    : ""
                }
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    articleCategoryId: Number(value),
                  }))
                }
                disabled={isLoading || isLoadingCategories}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="---Chọn danh mục---" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-3 mt-6">
              <Label className="font-medium">Trạng thái</Label>
              <Switch
                checked={formData.status}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({ ...prev, status: v }))
                }
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">
                {formData.status ? "Hiển thị" : "Ẩn"}
              </span>
            </div>
          </div>
        </div>

        {/* --- HÌNH ĐẠI DIỆN --- */}
        <div className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
          <h2 className="text-lg font-semibold mb-2">Hình đại diện</h2>

          <div className="flex items-center gap-4 flex-wrap">
            <FileUpload
              onFilesSelected={handleThumbnailFiles}
              accept="image/*"
              multiple={false}
              maxFiles={1}
              disabled={isLoading || isUploading}
              variant="thumbnail"
              placeholder="Nhấp để tải ảnh hoặc kéo thả vào đây"
              description="PNG, JPG tối đa 10MB"
            />

            {previewThumbnailUrl && (
              <div className="relative inline-block">
                <img
                  src={previewThumbnailUrl}
                  alt="Preview"
                  className="w-42 h-42 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  disabled={isLoading || isUploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- NỘI DUNG BÀI VIẾT --- */}
      <div className="p-4 border rounded-xl bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Nội dung bài viết</h2>
        <RichTextEditor
          ref={quillRef}
          defaultValue={formData.content}
          placeholder="Nhập nội dung bài viết..."
          className="min-h-[250px]"
        />
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading ? "Đang xử lý..." : article ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}
