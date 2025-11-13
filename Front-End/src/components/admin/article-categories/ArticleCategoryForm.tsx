import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [createdAt, setCreatedAt] = useState("");
  const [modifiedAt, setModifiedAt] = useState("");

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setSlug(category.slug || "");
      setCreatedAt(category.createdAt || "");
      setModifiedAt(category.modifiedAt || "");
    } else {
      setTitle("");
      setSlug("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateArticleCategoryRequest = {
      title,
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {category ? "Cập nhật" : "Thêm"}
        </Button>
      </div>
    </form>
  );
}
