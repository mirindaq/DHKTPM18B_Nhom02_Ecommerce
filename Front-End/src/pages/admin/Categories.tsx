import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: number
  name: string
  description: string
  productCount: number
  status: "active" | "inactive"
  createdAt: string
}

const mockCategories: Category[] = [
  {
    id: 1,
    name: "Điện thoại",
    description: "Các loại điện thoại di động",
    productCount: 45,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Laptop",
    description: "Máy tính xách tay các loại",
    productCount: 32,
    status: "active",
    createdAt: "2024-01-10"
  },
  {
    id: 3,
    name: "Phụ kiện",
    description: "Phụ kiện điện tử",
    productCount: 78,
    status: "active",
    createdAt: "2024-01-05"
  },
  {
    id: 4,
    name: "Đồng hồ thông minh",
    description: "Đồng hồ thông minh và fitness tracker",
    productCount: 23,
    status: "inactive",
    createdAt: "2024-01-01"
  }
]

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: number) => {
    setCategories(categories.filter(c => c.id !== id))
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsAddDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý danh mục</h1>
          <p className="text-lg text-gray-600">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingCategory ? "Cập nhật thông tin danh mục" : "Điền thông tin danh mục mới"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium text-gray-700">
                  Tên danh mục
                </Label>
                <Input
                  id="name"
                  defaultValue={editingCategory?.name || ""}
                  className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right font-medium text-gray-700">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  defaultValue={editingCategory?.description || ""}
                  className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {editingCategory ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={16}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Tên danh mục</TableHead>
              <TableHead className="font-semibold text-gray-700">Mô tả</TableHead>
              <TableHead className="font-semibold text-gray-700">Số sản phẩm</TableHead>
              <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày tạo</TableHead>
              <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell className="font-semibold text-gray-900">{category.name}</TableCell>
                <TableCell className="text-gray-600">{category.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">
                    {category.productCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.status === "active" ? "default" : "secondary"} className={
                    category.status === "active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }>
                    {category.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{formatDate(category.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
