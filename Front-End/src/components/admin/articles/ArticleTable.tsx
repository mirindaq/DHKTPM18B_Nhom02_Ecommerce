import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Loader2, PowerOff, Power, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article } from "@/types/article.type";
import { Badge } from "@/components/ui/badge";

interface Props {
  articles: Article[];
  onEdit: (article: Article) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
}

export default function ArticleTable({ articles, onEdit, onToggleStatus, isLoading, currentPage = 1, pageSize = 7 }: Props) {
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-600">
          Tổng cộng:{" "}
          <span className="font-semibold text-gray-900">{articles.length}</span>{" "}
          bài viết
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700" >STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Ảnh bìa</TableHead>
              <TableHead className="font-semibold text-gray-700">Tiêu đề</TableHead>
              <TableHead className="font-semibold text-gray-700">Danh mục</TableHead>
              <TableHead className="font-semibold text-gray-700">Người viết</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày tạo</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        Không tìm thấy bài viết nào
                      </p>
                      <p className="text-sm text-gray-400">
                        Thử tìm kiếm với từ khóa khác hoặc thêm bài viết mới
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((a, idx) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                      {a.thumbnail ? (
                        <img
                          src={a.thumbnail}
                          alt={a.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{a.title}</TableCell>
                  <TableCell>{a.category.title ?? "Không rõ"}</TableCell>
                  <TableCell>{a.staffName}</TableCell>
                  <TableCell>{formatDate(a.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={a.status ? "default" : "secondary"} className={
                      a.status
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }>
                      {a.status ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(a)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(a.id)}
                      className={`${a.status
                        ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }`}
                      disabled={isLoading}
                    >
                      {a.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
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
