import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Loader2, Trash2 } from "lucide-react"
import type { ArticleCategory} from "@/types/article-category.type"

interface Props {
  categories: ArticleCategory[];
  onEdit: (category: ArticleCategory) => void;
  onSearch: (searchTerm: string) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
}

export default function ArticleCategoryTable({
  categories,
  onEdit,
  onSearch,
  onDelete,
  isLoading,
  currentPage = 1,
  pageSize = 7
}: Props) {

  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(searchTerm);
    }
  };

  


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
              onKeyDown={handleSearch}
            />
          </div>
          <Button
            onClick={() => onSearch(searchTerm)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold text-gray-900">{categories.length}</span> danh mục
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Ảnh</TableHead>
              <TableHead className="font-semibold text-gray-700">Tiêu đề</TableHead>
              <TableHead className="font-semibold text-gray-700">Đường dẫn</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày tạo</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {searchTerm ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Hãy thêm danh mục đầu tiên"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{category.title}</TableCell>
                  <TableCell className="font-semibold">{category.slug}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(category.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(category.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
