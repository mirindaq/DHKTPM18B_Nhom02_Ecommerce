import { Button } from '@/components/ui/button';

export default function PromotionalBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Left Banner - iPhone Air */}
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg overflow-hidden p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">iPhone Air</h2>
            <p className="text-white/90 text-sm md:text-base mb-2">Chào Bạn Mới!</p>
            <p className="text-white/90 text-sm md:text-base mb-4">Đảm thêm 300K</p>
            <div className="space-y-1 text-white/90 text-xs md:text-sm">
              <p>Lên đời chỉ từ 20.78 Triệu</p>
              <p>Góp từ 57K/Ngày</p>
              <p>Thời hạn 12 Tháng</p>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center mb-4 md:mb-0">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-20 md:w-16 md:h-24 bg-white/20 rounded-lg backdrop-blur-sm"
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto border-white text-white hover:bg-white/10"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Right Banner - iPhone 17 PRO */}
      <div className="relative bg-black rounded-lg overflow-hidden p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="text-orange-500 text-2xl md:text-3xl font-bold mb-2">iPhone 17 PRO</h2>
            <p className="text-white text-sm md:text-base mb-2">Bù thật ít. Đổi thật nhanh.</p>
            <p className="text-white text-sm md:text-base mb-4">Ưu đãi lên đến 7 Triệu.</p>
          </div>
          <div className="flex-1 flex justify-center items-center mb-4 md:mb-0">
            <div className="w-24 h-32 md:w-32 md:h-40 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <div className="w-16 h-20 bg-orange-500/30 rounded-lg" />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto border-white text-white hover:bg-white/10"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

