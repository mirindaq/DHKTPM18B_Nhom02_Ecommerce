import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { dashboardService } from '@/services/dashboard.service'
import type { TopProductResponse, ProductDetailResponse } from '@/types/dashboard.type'

interface AllProductsModalProps {
  open: boolean
  onClose: () => void
  timeType: 'day' | 'month' | 'year'
  startDate?: string
  endDate?: string
  year?: number
  month?: number
}

export default function AllProductsModal({
  open,
  onClose,
  timeType,
  startDate,
  endDate,
  year,
  month
}: AllProductsModalProps) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<TopProductResponse[]>([])
  const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(new Set())
  const [productDetails, setProductDetails] = useState<Record<number, ProductDetailResponse>>({})

  useEffect(() => {
    if (open) {
      fetchAllProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, timeType, startDate, endDate, year, month])

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      let response
      
      if (timeType === 'day') {
        response = await dashboardService.getAllProductsByDay(startDate, endDate)
      } else if (timeType === 'month') {
        response = await dashboardService.getAllProductsByMonth(year, month)
      } else {
        response = await dashboardService.getAllProductsByYear(year)
      }
      
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching all products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = () => {
    if (timeType === 'day' && startDate && endDate) {
      return `Theo ngày: ${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
    } else if (timeType === 'month' && year && month) {
      return `Theo tháng: Tháng ${month}/${year}`
    } else if (timeType === 'year' && year) {
      return `Theo năm: ${year}`
    }
    return ''
  }

  const handleToggleDetail = async (productId: number) => {
    const newExpandedIds = new Set(expandedProductIds)
    
    if (newExpandedIds.has(productId)) {
      newExpandedIds.delete(productId)
      setExpandedProductIds(newExpandedIds)
    } else {
      newExpandedIds.add(productId)
      setExpandedProductIds(newExpandedIds)
      
      if (!productDetails[productId]) {
        try {
          let detailStartDate = startDate
          let detailEndDate = endDate
          
          if (timeType === 'month' && year && month) {
            const firstDay = new Date(year, month - 1, 1)
            const lastDay = new Date(year, month, 0)
            detailStartDate = firstDay.toISOString().split('T')[0]
            detailEndDate = lastDay.toISOString().split('T')[0]
          } else if (timeType === 'year' && year) {
            detailStartDate = `${year}-01-01`
            detailEndDate = `${year}-12-31`
          }
          
          const response = await dashboardService.getProductDetail(productId, detailStartDate, detailEndDate)
          setProductDetails(prev => ({
            ...prev,
            [productId]: response.data
          }))
        } catch (error) {
          console.error('Error fetching product detail:', error)
          setProductDetails(prev => ({
            ...prev,
            [productId]: {
              productId,
              productName: '',
              productImage: '',
              totalQuantitySold: 0,
              totalRevenue: 0,
              orders: []
            }
          }))
        }
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="text-xl font-bold">Tất cả sản phẩm bán chạy</div>
            <div className="text-sm font-normal text-gray-500 mt-1">
              {getPeriodLabel()}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Không có sản phẩm nào được bán trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Tổng số sản phẩm</div>
                  <div className="text-2xl font-bold text-purple-600">{products.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng số lượng bán</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {products.reduce((sum, p) => sum + p.totalQuantitySold, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng doanh thu</div>
                  <div className="text-2xl font-bold text-green-600">
                    {products.reduce((sum, p) => sum + p.totalRevenue, 0).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng bán
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {products.map((product, index) => (
                    <>
                      <tr key={product.productId} className="hover:bg-gray-50 transition-colors border-b">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold">
                            {product.totalQuantitySold.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">
                            {product.totalRevenue.toLocaleString('vi-VN')}₫
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDetail(product.productId)}
                            className="text-xs gap-1"
                          >
                            {expandedProductIds.has(product.productId) ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Chi tiết
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {expandedProductIds.has(product.productId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            {productDetails[product.productId] ? (
                              <div className="space-y-3">
                                <div className="text-sm font-semibold text-gray-700 mb-3">
                                  Danh sách đơn hàng ({productDetails[product.productId].orders?.length || 0})
                                </div>
                                {!productDetails[product.productId].orders || productDetails[product.productId].orders.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    Không có đơn hàng nào
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {productDetails[product.productId].orders.map((order) => (
                                      <div
                                        key={order.orderId}
                                        className="bg-white border rounded p-3 text-sm"
                                      >
                                        <div className="grid grid-cols-6 gap-3">
                                          <div>
                                            <div className="text-xs text-gray-500">Mã đơn</div>
                                            <div className="font-semibold">{order.orderCode}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Ngày đặt</div>
                                            <div className="font-medium">{formatDate(order.orderDate)}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Khách hàng</div>
                                            <div className="font-medium">{order.customerName}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Số lượng</div>
                                            <div className="font-semibold">{order.quantityOrdered}</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Đơn giá</div>
                                            <div className="font-semibold">
                                              {order.unitPrice.toLocaleString('vi-VN')}₫
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-500">Thành tiền</div>
                                            <div className="font-semibold">
                                              {order.totalPrice.toLocaleString('vi-VN')}₫
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
