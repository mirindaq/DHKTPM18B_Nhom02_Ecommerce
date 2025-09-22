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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Image as ImageIcon,
  Package,
  DollarSign
} from "lucide-react";
import type { Product } from "@/types/product.type";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isLoading: boolean;
  onSearch: (searchTerm: string) => void;
  currentPage: number;
  pageSize: number;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
  onSearch,
  currentPage,
  pageSize,
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Search bar skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>SPU</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
      </form>

      {/* Products table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead className="w-24">SPU</TableHead>
              <TableHead className="w-32">Giá</TableHead>
              <TableHead className="w-24">Giảm giá</TableHead>
              <TableHead className="w-24">Tồn kho</TableHead>
              <TableHead className="w-24">Trạng thái</TableHead>
              <TableHead className="w-20">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <Package className="h-8 w-8 text-gray-400" />
                    <p>Không có sản phẩm nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
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

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 line-clamp-2 ">
                        {product.name}
                      </p>
                    </div>
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
                    <Badge
                      variant={product.status ? "default" : "secondary"}
                      className={product.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {product.status ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleStatus(product.id)}
                          className={product.status ? "text-orange-600" : "text-green-600"}
                        >
                          {product.status ? "Tạm dừng" : "Kích hoạt"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
