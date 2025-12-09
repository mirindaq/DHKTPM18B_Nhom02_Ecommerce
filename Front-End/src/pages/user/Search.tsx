import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search as SearchIcon } from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.type';
import Breadcrumb from '@/components/user/search/Breadcrumb';
import SortSection from '@/components/user/search/SortSection';
import ProductCard from '@/components/user/ProductCard';
import { useQuery } from '@/hooks/useQuery';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PUBLIC_PATH } from '@/constants/path';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const size = 10;
  const sortBy = (searchParams.get('sortBy') || 'popular') as SortOption;

  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useQuery<{ data: { data: Product[], totalPage: number, totalItem: number } }>(
    () => productService.searchProductsWithElasticsearch(query, page, size, sortBy),
    {
      queryKey: ['search-products-elasticsearch', query, page.toString(), sortBy],
      enabled: !!query && query.trim().length > 0,
      onError: (err) => {
        console.error('Lỗi khi tải products:', err);
      }
    }
  );

  const ProductSkeleton = () => (
    <div className="overflow-hidden bg-white rounded-xl border border-gray-200">
      <Skeleton className="aspect-[5/4] w-full" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )


  const products = productsData?.data?.data || [];
  const totalItem = productsData?.data?.totalItem || 0;
  const totalPage = productsData?.data?.totalPage || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchInput.trim());
      params.set('page', '1');
      // Preserve sortBy when searching
      if (sortBy && sortBy !== 'popular') {
        params.set('sortBy', sortBy);
      }
      setSearchParams(params);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    params.set('page', '1'); // Reset to page 1 when sorting changes
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query || query.trim().length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Kết quả tìm kiếm' },
            ]}
          />
        <div className="text-center py-12">
          <SearchIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tìm kiếm sản phẩm
          </h2>
          <p className="text-gray-500 mb-6">
            Nhập từ khóa để tìm kiếm sản phẩm bạn muốn
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Breadcrumb
          items={[
            { label: 'Kết quả tìm kiếm cho', href: undefined },
            { label: `'${query}'` },
          ]}
        />

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            <SearchIcon size={20} className="mr-2" />
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Kết quả tìm kiếm
            </h2>
            <p className="text-sm text-gray-500">
              Tìm thấy <span className="font-semibold text-gray-900">{totalItem.toLocaleString()}</span> sản phẩm cho từ khóa <span className="font-semibold text-gray-900">'{query}'</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sort section */}
      <SortSection sortBy={sortBy} onSortChange={handleSortChange} />

      {/* Products grid */}
      {productsLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <SearchIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            Không tìm thấy sản phẩm nào cho từ khóa <span className="font-semibold">'{query}'</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Hãy thử tìm kiếm với từ khóa khác
          </p>
          <Button 
            onClick={() => {
              setSearchInput('');
              navigate(PUBLIC_PATH.HOME);
            }}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Về trang chủ
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Trước
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                  let pageNum;
                  if (totalPage <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPage - 2) {
                    pageNum = totalPage - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      className={page === pageNum ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPage}
              >
                Sau
              </Button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

