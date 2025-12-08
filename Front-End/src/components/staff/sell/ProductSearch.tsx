import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductSearchProps {
  searchQuery: string
  isSearching: boolean
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
}

export default function ProductSearch({
  searchQuery,
  isSearching,
  onSearchQueryChange,
  onSearch
}: ProductSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Tìm kiếm sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Nhập tên sản phẩm, mã SKU..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10 h-11"
            />
          </div>
          <Button 
            onClick={onSearch} 
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

