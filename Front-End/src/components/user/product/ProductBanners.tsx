
import { Skeleton } from "@/components/ui/skeleton";
import type { Banner } from "@/types/banner.type";

interface ProductBannersProps {
  banners: Banner[];
  isLoading: boolean;
}

export default function ProductBanners({ banners, isLoading }: ProductBannersProps) {
  if (!isLoading && banners.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Khuyến mãi</h2>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.slice(0, 2).map((banner) => (
            <a
              key={banner.id}
              href={banner.linkUrl || '#'}
              className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/avatar.jpg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                {banner.title && (
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {banner.title}
                  </h3>
                )}
                {banner.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

