import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Image as ImageIcon,
  Package
} from "lucide-react";
import type { Product } from "@/types/product.type";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
  onSearch: (searchTerm: string) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onSearch,
  isLoading,
  currentPage = 1,
  pageSize = 7
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchTerm);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDiscount = (discount: number) => {
    return `${(discount * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
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
          Tổng cộng: <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Hình ảnh</TableHead>
              <TableHead className="font-semibold text-gray-700">Tên sản phẩm</TableHead>
              <TableHead className="font-semibold text-gray-700">SPU</TableHead>
              <TableHead className="font-semibold text-gray-700">Giá</TableHead>
              <TableHead className="font-semibold text-gray-700">Giảm giá</TableHead>
              <TableHead className="font-semibold text-gray-700">Tồn kho</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {searchTerm ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Hãy thêm sản phẩm đầu tiên"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 max-w-xs truncate" title={product.name}>
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.spu}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          <p className="font-medium text-green-600">
                            {formatPrice(product.variants[0].price)}
                          </p>
                          {product.variants[0].oldPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(product.variants[0].oldPrice)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có giá</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.discount > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        -{formatDiscount(product.discount)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Không</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {product.stock}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status ? "default" : "secondary"} className={
                      product.status
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }>
                      {product.status ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(product.id)}
                        className={`${product.status
                          ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                          : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                          }`}
                        disabled={isLoading}
                      >
                        {product.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(product.id)}
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
