import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Settings, Loader2, Trash2 } from "lucide-react"
import type { FilterCriteria } from "@/types/filterCriteria.type"

interface FilterCriteriaTableProps {
  filterCriterias: FilterCriteria[]
  onSetValues: (filterCriteria: FilterCriteria) => void
  onDelete: (id: number) => void
  isLoading?: boolean
  onSearch: (searchTerm: string) => void
  currentPage?: number
  pageSize?: number
  selectedCategoryId?: number
}

export default function FilterCriteriaTable({ 
  filterCriterias, 
  onSetValues,
  onDelete,
  onSearch,
  isLoading,
  currentPage = 1,
  pageSize = 7,
  selectedCategoryId
}: FilterCriteriaTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(searchTerm)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm tiêu chí lọc..."
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
          Tổng cộng: <span className="font-semibold text-gray-900">{filterCriterias.length}</span> tiêu chí
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Tên tiêu chí</TableHead>
              <TableHead className="font-semibold text-gray-700">Số giá trị</TableHead>
              <TableHead className="font-semibold text-gray-700">Giá trị</TableHead>
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
            ) : filterCriterias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        {searchTerm ? "Không tìm thấy tiêu chí nào" : "Chưa có tiêu chí nào"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Thử tìm kiếm với từ khóa khác" : selectedCategoryId ? "Hãy thêm tiêu chí đầu tiên cho danh mục này" : "Hãy chọn danh mục để xem tiêu chí"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filterCriterias.map((filterCriteria, index) => (
                <TableRow key={filterCriteria.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{filterCriteria.name}</TableCell>

                  <TableCell className="text-gray-600 font-medium">
                    {filterCriteria.filterValues?.length || 0}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {filterCriteria.filterValues && filterCriteria.filterValues.length > 0 ? (
                        <>
                          {filterCriteria.filterValues.slice(0, 3).map((fv, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full font-medium"
                            >
                              {fv.value}
                            </span>
                          ))}
                          {filterCriteria.filterValues.length > 3 && (
                            <span className="text-xs bg-gray-200 text-gray-600 border border-gray-300 px-2.5 py-1 rounded-full font-medium">
                              +{filterCriteria.filterValues.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Chưa có giá trị</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetValues(filterCriteria)}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                        disabled={isLoading}
                        title="Quản lý giá trị"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(filterCriteria.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={isLoading}
                        title="Xóa tiêu chí lọc"
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
  )
}

