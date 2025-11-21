import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.type';
import Breadcrumb from '@/components/user/search/Breadcrumb';
import ProductCard from '@/components/user/ProductCard';
import { useQuery } from '@/hooks/useQuery';
import { Button } from '@/components/ui/button';
import { PUBLIC_PATH } from '@/constants/path';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const size = 12;

  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useQuery<{ data: { data: Product[], totalPage: number, totalItem: number } }>(
    () => productService.searchProductsWithElasticsearch(query, page, size),
    {
      queryKey: ['search-products-elasticsearch', query, page],
      enabled: !!query && query.trim().length > 0,
      onError: (err) => {
        console.error('Lỗi khi tải products:', err);
      }
    }
  );

  const products = productsData?.data?.data || [];
  const totalItem = productsData?.data?.totalItem || 0;
  const totalPage = productsData?.data?.totalPage || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchInput.trim());
      params.set('page', '1');
      setSearchParams(params);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query || query.trim().length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
        <p className="text-gray-600">
          Tìm thấy <span className="font-semibold text-gray-900">{totalItem.toLocaleString()}</span> sản phẩm cho từ khóa <span className="font-semibold text-gray-900">'{query}'</span>
        </p>
      </div>

      {/* Sort section - simplified for search */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-900">Sắp xếp theo</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
            >
              Liên quan
            </Button>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {productsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
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
          >
            Về trang chủ
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
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
          )}
        </>
      )}
    </div>
  );
}

