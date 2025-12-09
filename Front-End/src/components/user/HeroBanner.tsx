import { useState, useEffect } from 'react'
import { bannerService } from '@/services/banner.service'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@/hooks'
import type { BannerDisplayResponse } from '@/types/banner.type'

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[350px] lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[350px] lg:h-full bg-gradient-to-r from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center text-white px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">Chào mừng đến EcomStore</h1>
          <p className="text-base md:text-lg lg:text-xl drop-shadow-md">Sản phẩm chính hãng, giá tốt nhất</p>
        </div>
      </div>
    )
  }

  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="w-full h-[300px] md:h-[350px] lg:h-full rounded-2xl overflow-hidden relative group">
        <a
          href={banner.linkUrl || '#'}
          className="block w-full h-full"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Banner'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="eager"
          />
        </a>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] md:h-[350px] lg:h-full rounded-2xl overflow-hidden relative group">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <a
            key={banner.id}
            href={banner.linkUrl || '#'}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </a>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
