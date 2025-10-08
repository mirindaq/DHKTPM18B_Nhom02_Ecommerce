import { Skeleton } from '@/components/ui/skeleton'

export default function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Checkbox skeleton */}
        <div className="w-4 h-4 bg-gray-200 rounded"></div>

        {/* Product Image skeleton */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>

        {/* Product Info skeleton */}
        <div className="flex-1 min-w-0">
          {/* Product name skeleton */}
          <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
          
          {/* SKU skeleton */}
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
          
          {/* Badge skeleton */}
          <div className="h-6 bg-gray-200 rounded w-16 mb-3"></div>

          {/* Price skeleton */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>

          {/* Quantity controls skeleton */}
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="flex items-center border rounded-lg">
              <div className="h-8 w-8 bg-gray-200 rounded-l"></div>
              <div className="px-3 py-1 min-w-[60px]">
                <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-r"></div>
            </div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex flex-col items-end space-y-2">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export function CartSummarySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        <div className="text-right">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}
