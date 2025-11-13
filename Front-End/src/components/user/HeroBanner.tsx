import { bannerService } from '@/services/banner.service'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@/hooks'
import type { BannerDisplayResponse } from '@/types/banner.type'

export default function HeroBanner() {
  const {
    data: bannersData,
    isLoading: loading,
  } = useQuery<BannerDisplayResponse>(
    () => bannerService.getBannersToDisplay(),
    {
      queryKey: ['banners', 'display'],
    }
  )

  const banners = bannersData?.data || []

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="w-full h-64 md:h-80 lg:h-[400px] bg-gray-200 rounded-xl flex items-center justify-center shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full mb-8">
        <div className="w-full h-64 md:h-80 lg:h-[400px] bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Chào mừng đến với cửa hàng</h1>
            <p className="text-base md:text-lg lg:text-xl">Sản phẩm chính hãng, giá tốt nhất</p>
          </div>
        </div>
      </div>
    )
  }

  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="w-full mb-8">
        <a
          href={banner.linkUrl || '#'}
          className="block w-full h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Banner'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 will-change-transform"
            style={{
              imageRendering: 'crisp-edges',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            loading="eager"
          />
        </a>
      </div>
    )
  }

  return (
    <div className="w-full mb-8">
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <a
                href={banner.linkUrl || '#'}
                className="block w-full h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 will-change-transform"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  loading="eager"
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 md:left-6 bg-white/90 hover:bg-white shadow-lg border-0" />
        <CarouselNext className="right-4 md:right-6 bg-white/90 hover:bg-white shadow-lg border-0" />
      </Carousel>
    </div>
  )
}

