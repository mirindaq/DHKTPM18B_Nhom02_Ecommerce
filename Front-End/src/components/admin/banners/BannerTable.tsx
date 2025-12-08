import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomBadge } from "@/components/ui/CustomBadge"
import { Search, Edit, Power, PowerOff, Loader2 } from "lucide-react"
import type { Banner } from "@/types/banner.type"

interface BannerTableProps {
  banners: Banner[]
  onEdit: (banner: Banner) => void
  onToggleStatus: (id: number) => void
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
}

export default function BannerTable({ 
  banners, 
  onEdit, 
  onToggleStatus, 
  isLoading,
  currentPage = 1,
  pageSize = 7
}: BannerTableProps) {
  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end py-4">
        <div className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold text-gray-900">{banners.length}</span> banner
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">STT</TableHead>
              <TableHead className="font-semibold text-gray-700">Hình ảnh</TableHead>
              <TableHead className="font-semibold text-gray-700">Tiêu đề</TableHead>
              <TableHead className="font-semibold text-gray-700">Mô tả</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày bắt đầu</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày kết thúc</TableHead>
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
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-24 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-600">
                        Chưa có banner nào
                      </p>
                      <p className="text-sm text-gray-400">
                        Hãy thêm banner đầu tiên
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner, index) => (
                <TableRow key={banner.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-center font-medium text-gray-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={banner.imageUrl || "/assets/avatar.jpg"}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/assets/avatar.jpg"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{banner.title}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate" title={banner.description}>
                    {banner.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDateOnly(banner.startDate)}</TableCell>
                  <TableCell className="text-gray-600">{formatDateOnly(banner.endDate)}</TableCell>
                  <TableCell>
                    <CustomBadge variant={banner.isActive ? "success" : "secondary"} className={
                      banner.isActive
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }>
                      {banner.isActive ? "Hoạt động" : "Không hoạt động"}
                    </CustomBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(banner)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(banner.id)}
                        className={`${
                          banner.isActive 
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        }`}
                        disabled={isLoading}
                      >
                        {banner.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
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

