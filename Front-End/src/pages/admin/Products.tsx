import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  CreateProductRequest,
  Product,
  ProductListResponse,
} from "@/types/product.type";
import { ProductDialog } from "@/components/admin/products";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { useQuery, useMutation } from "@/hooks";
import { Plus } from "lucide-react";

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useQuery<ProductListResponse>(
    () => productService.getProducts(currentPage, pageSize, searchTerm),
    {
      queryKey: [
        "brands",
        currentPage.toString(),
        pageSize.toString(),
        searchTerm,
      ],
    }
  );

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  // Create product
  const createProductMutation = useMutation(
    (data: CreateProductRequest) => productService.createProduct(data),
    {
      onSuccess: () => {
        toast.success("Thêm sản phẩm thành công");
        refetchProducts();
        setIsDialogOpen(false);
        setEditingProduct(null);
      },
      onError: (error) => {
        console.error("Error creating product:", error);
        toast.error("Không thể thêm sản phẩm");
      },
    }
  );

  // Update product
  const updateProductMutation = useMutation(
    ({ id, data }: { id: number; data: CreateProductRequest }) =>
      productService.updateProduct(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật sản phẩm thành công");
        refetchProducts();
        setIsDialogOpen(false);
        setEditingProduct(null);
      },
      onError: (error) => {
        console.error("Error updating product:", error);
        toast.error("Không thể cập nhật sản phẩm");
      },
    }
  );

  const handleFormSubmit = (data: CreateProductRequest) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  // return (
  //   <div className="space-y-3 p-2">
  //     <div className="flex justify-between items-center">
  //       <div className="space-y-1">
  //         <h1 className="text-2xl font-bold tracking-tight text-gray-900">
  //           Quản lý sản phẩm
  //         </h1>
  //         <p className="text-lg text-gray-600">
  //           Quản lý danh sách sản phẩm trong hệ thống
  //         </p>
  //       </div>
  //       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  //         <DialogTrigger asChild>
  //           <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
  //             <Plus className="mr-2 h-4 w-4" />
  //             Thêm sản phẩm
  //           </Button>
  //         </DialogTrigger>
  //         <DialogContent className="sm:max-w-[500px]">
  //           <DialogHeader>
  //             <DialogTitle className="text-xl font-semibold text-gray-900">
  //               {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
  //             </DialogTitle>
  //             <DialogDescription className="text-gray-600">
  //               {editingProduct
  //                 ? "Cập nhật thông tin sản phẩm"
  //                 : "Điền thông tin sản phẩm mới"}
  //             </DialogDescription>
  //           </DialogHeader>
  //           <div className="grid gap-6 py-4">
  //             <div className="grid grid-cols-4 items-center gap-4">
  //               <Label
  //                 htmlFor="name"
  //                 className="text-right font-medium text-gray-700"
  //               >
  //                 Tên sản phẩm
  //               </Label>
  //               <Input
  //                 id="name"
  //                 defaultValue={editingProduct?.name || ""}
  //                 className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
  //               />
  //             </div>
  //             <div className="grid grid-cols-4 items-center gap-4">
  //               <Label
  //                 htmlFor="category"
  //                 className="text-right font-medium text-gray-700"
  //               >
  //                 Danh mục
  //               </Label>
  //               <Select defaultValue={editingProduct?.category || ""}>
  //                 <SelectTrigger className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
  //                   <SelectValue placeholder="Chọn danh mục" />
  //                 </SelectTrigger>
  //                 <SelectContent>
  //                   <SelectItem value="Điện thoại">Điện thoại</SelectItem>
  //                   <SelectItem value="Laptop">Laptop</SelectItem>
  //                   <SelectItem value="Phụ kiện">Phụ kiện</SelectItem>
  //                 </SelectContent>
  //               </Select>
  //             </div>
  //             <div className="grid grid-cols-4 items-center gap-4">
  //               <Label
  //                 htmlFor="price"
  //                 className="text-right font-medium text-gray-700"
  //               >
  //                 Giá
  //               </Label>
  //               <Input
  //                 id="price"
  //                 type="number"
  //                 defaultValue={editingProduct?.price || ""}
  //                 className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
  //               />
  //             </div>
  //             <div className="grid grid-cols-4 items-center gap-4">
  //               <Label
  //                 htmlFor="stock"
  //                 className="text-right font-medium text-gray-700"
  //               >
  //                 Tồn kho
  //               </Label>
  //               <Input
  //                 id="stock"
  //                 type="number"
  //                 defaultValue={editingProduct?.stock || ""}
  //                 className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
  //               />
  //             </div>
  //             <div className="grid grid-cols-4 items-center gap-4">
  //               <Label
  //                 htmlFor="description"
  //                 className="text-right font-medium text-gray-700"
  //               >
  //                 Mô tả
  //               </Label>
  //               <Textarea
  //                 id="description"
  //                 defaultValue={editingProduct?.description || ""}
  //                 className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
  //               />
  //             </div>
  //           </div>
  //           <DialogFooter>
  //             <Button
  //               type="submit"
  //               className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
  //             >
  //               {editingProduct ? "Cập nhật" : "Thêm"}
  //             </Button>
  //           </DialogFooter>
  //         </DialogContent>
  //       </Dialog>
  //     </div>

  //     <div className="flex items-center py-4">
  //       <div className="relative flex-1 max-w-sm">
  //         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  //         <Input
  //           placeholder="Tìm kiếm sản phẩm..."
  //           value={searchTerm}
  //           onChange={(e) => setSearchTerm(e.target.value)}
  //           size={16}
  //           className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
  //         />
  //       </div>
  //     </div>

  //     <div className="rounded-lg border border-gray-200 overflow-hidden">
  //       <Table>
  //         <TableHeader>
  //           <TableRow className="bg-gray-50 hover:bg-gray-50">
  //             <TableHead className="font-semibold text-gray-700">
  //               Hình ảnh
  //             </TableHead>
  //             <TableHead className="font-semibold text-gray-700">
  //               Tên sản phẩm
  //             </TableHead>
  //             <TableHead className="font-semibold text-gray-700">
  //               Danh mục
  //             </TableHead>
  //             <TableHead className="font-semibold text-gray-700">Giá</TableHead>
  //             <TableHead className="font-semibold text-gray-700">
  //               Tồn kho
  //             </TableHead>
  //             <TableHead className="font-semibold text-gray-700">
  //               Trạng thái
  //             </TableHead>
  //             <TableHead className="font-semibold text-gray-700">
  //               Thao tác
  //             </TableHead>
  //           </TableRow>
  //         </TableHeader>
  //         <TableBody>
  //           {filteredProducts.map((product) => (
  //             <TableRow
  //               key={product.id}
  //               className="hover:bg-gray-50 transition-colors duration-200"
  //             >
  //               <TableCell>
  //                 <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
  //                   <Package className="h-6 w-6 text-gray-400" />
  //                 </div>
  //               </TableCell>
  //               <TableCell className="font-semibold text-gray-900">
  //                 {product.name}
  //               </TableCell>
  //               <TableCell>
  //                 <Badge
  //                   variant="outline"
  //                   className="border-gray-200 text-gray-700 bg-gray-50"
  //                 >
  //                   {product.category}
  //                 </Badge>
  //               </TableCell>
  //               <TableCell className="font-semibold text-gray-900">
  //                 {formatPrice(product.price)}
  //               </TableCell>
  //               <TableCell>
  //                 <span
  //                   className={`px-2 py-1 rounded-full text-xs font-medium ${
  //                     product.stock > 20
  //                       ? "bg-green-100 text-green-800"
  //                       : product.stock > 10
  //                       ? "bg-yellow-100 text-yellow-800"
  //                       : "bg-red-100 text-red-800"
  //                   }`}
  //                 >
  //                   {product.stock}
  //                 </span>
  //               </TableCell>
  //               <TableCell>
  //                 <Badge
  //                   variant={
  //                     product.status === "active" ? "default" : "secondary"
  //                   }
  //                   className={
  //                     product.status === "active"
  //                       ? "bg-green-100 text-green-800 border-green-200"
  //                       : "bg-gray-100 text-gray-800 border-gray-200"
  //                   }
  //                 >
  //                   {product.status === "active"
  //                     ? "Hoạt động"
  //                     : "Không hoạt động"}
  //                 </Badge>
  //               </TableCell>
  //               <TableCell>
  //                 <div className="flex space-x-2">
  //                   <Button
  //                     variant="outline"
  //                     size="sm"
  //                     className="border-gray-200 hover:bg-gray-50 hover:border-gray-300"
  //                   >
  //                     <Eye className="h-4 w-4" />
  //                   </Button>
  //                   <Button
  //                     variant="outline"
  //                     size="sm"
  //                     onClick={() => handleEdit(product)}
  //                     className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
  //                   >
  //                     <Edit className="h-4 w-4" />
  //                   </Button>
  //                   <Button
  //                     variant="outline"
  //                     size="sm"
  //                     onClick={() => handleDelete(product.id)}
  //                     className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
  //                   >
  //                     <Trash2 className="h-4 w-4" />
  //                   </Button>
  //                 </div>
  //               </TableCell>
  //             </TableRow>
  //           ))}
  //         </TableBody>
  //       </Table>
  //     </div>
  //   </div>
  // );

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các sản phẩm sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* <ProductTable
        brands={brands}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingBrands}
        onSearch={handleSearch}
        currentPage={currentPage}
        pageSize={pageSize}
      /> */}

      {/* Pagination */}
      {/* {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      )} */}

      {/* Dialog */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        isLoading={
          createProductMutation.isLoading || updateProductMutation.isLoading
        }
      />
    </div>
  );
}
