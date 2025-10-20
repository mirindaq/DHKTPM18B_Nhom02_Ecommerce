import { useState, useEffect } from 'react';
import { rankingService } from '@/services/ranking.service';
import type { Rank } from '@/types/ranking.type';
import {
  Heart,
  Lock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Membership() {
  const [rankings, setRankings] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [nextRank, setNextRank] = useState<Rank | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock data - sẽ được thay thế bằng data thực từ API
  const totalSpent = 1828000;

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await rankingService.getAllRankings();
        if (response.status === 200 && response.data) {
          const sortedRankings = [...response.data].sort((a: Rank, b: Rank) => a.minSpending - b.minSpending);
          setRankings(sortedRankings);

          // Xác định hạng hiện tại và hạng tiếp theo
          const current = sortedRankings.find(
            (rank: Rank) => totalSpent >= rank.minSpending && totalSpent < rank.maxSpending
          );
          setCurrentRank(current || sortedRankings[0]);

          if (current) {
            const currentIndex = sortedRankings.findIndex((r: Rank) => r.id === current.id);
            if (currentIndex < sortedRankings.length - 1) {
              setNextRank(sortedRankings[currentIndex + 1]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [totalSpent]);

  const getRankColor = (rankName: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string; badgeBg: string; badgeText: string } } = {
      'S-NEW': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', badgeBg: 'bg-orange-600', badgeText: 'text-white' },
      'S-SILVER': { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400', badgeBg: 'bg-gray-600', badgeText: 'text-white' },
      'S-GOLD': { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-400', badgeBg: 'bg-yellow-600', badgeText: 'text-white' },
      'S-PLATINUM': { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-400', badgeBg: 'bg-blue-600', badgeText: 'text-white' },
      'S-DIAMOND': { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-400', badgeBg: 'bg-purple-600', badgeText: 'text-white' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', badgeBg: 'bg-gray-600', badgeText: 'text-white' }
    };
    return colors[rankName] || colors.default;
  };

  const remainingAmount = nextRank ? nextRank.minSpending - totalSpent : 0;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(rankings.length - 3, prev + 1));
  };

  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < rankings.length - 3;

  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin hạng thành viên...</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ưu đãi của bạn</h3>

            {/* Empty State */}
            <div className="text-center py-12">
              <div className="w-46 h-full mx-auto mb-5 flex items-center justify-center">
                <img
                  src={"/assets/empty.png"}
                  alt={"empty"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/assets/empty.png"
                  }}
                />
              </div>
              <p className="text-gray-600">Bạn đang chưa có ưu đãi nào</p>
            </div>

            {/* Rank Cards Carousel */}
            <div className="mt-8 relative">
              {/* Navigation Buttons */}
              <Button
                onClick={handlePrevSlide}
                disabled={!canGoPrev}
                variant="outline"
                size="icon"
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full shadow-lg ${
                  !canGoPrev ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              <Button
                onClick={handleNextSlide}
                disabled={!canGoNext}
                variant="outline"
                size="icon"
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full shadow-lg ${
                  !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>

              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  className="flex gap-4 transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * (33.33 + 1.33)}%)` }}
                >
                  {rankings.map((rank) => {
                    const isUnlocked = totalSpent >= rank.minSpending;
                    const isCurrent = rank.id === currentRank?.id;
                    const colors = getRankColor(rank.name);

                    return (
                      <Card
                        key={rank.id}
                        className={`flex-shrink-0 ${isCurrent
                          ? `${colors.bg} border-2 ${colors.border}`
                          : isUnlocked
                            ? `${colors.bg} opacity-90`
                            : 'bg-gray-100 opacity-60'
                          }`}
                        style={{ width: 'calc(33.33% - 10.67px)' }}
                      >
                        <CardContent className="px-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-bold ${colors.badgeBg} ${colors.badgeText}`}>
                              {rank.name}
                            </span>
                            {!isUnlocked && <Lock size={16} className="text-gray-400" />}
                          </div>

                          {isCurrent ? (
                            <>
                              <div className="text-xs text-gray-600 mb-1.5">
                                Đã mua <span className="font-bold">{totalSpent.toLocaleString('vi-VN')}đ</span>
                                {rank.maxSpending !== Number.MAX_VALUE && `/${rank.maxSpending.toLocaleString('vi-VN')}đ`}
                              </div>
                              {nextRank && remainingAmount > 0 && (
                                <div className="text-xs text-gray-600">
                                  Cần chi tiêu thêm <span className="font-bold">{remainingAmount.toLocaleString('vi-VN')}đ</span> để lên hạng <span className="font-bold">{nextRank.name}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-700">
                              {isUnlocked ? `Đã mở khóa - Giảm giá ${rank.discountRate}%` : '🔒 Chưa mở khóa hạng thành viên'}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Info Sections */}
            <div className="mt-8 space-y-6">
              {/* Điều kiện thăng cấp */}
              <Alert className="bg-red-50 border-red-200">
                <Heart className="text-red-600" />
                <AlertTitle>ĐIỀU KIỆN THĂNG CẤP</AlertTitle>
                <AlertDescription>
                  Tổng số tiền mua hàng tích lũy trong năm nay và năm liền trước đạt từ{' '}
                  {(currentRank?.minSpending || 0).toLocaleString('vi-VN')}đ đến{' '}
                  {currentRank?.maxSpending === Number.MAX_VALUE
                    ? 'không giới hạn'
                    : (currentRank?.maxSpending || 0).toLocaleString('vi-VN') + 'đ'}
                  , không tính đơn hàng doanh nghiệp B2B
                </AlertDescription>
              </Alert>

              {/* Ưu đãi mua hàng */}
              <Alert>
                <AlertTitle>ƯU ĐÃI MUA HÀNG</AlertTitle>
                <AlertDescription>
                  {currentRank?.discountRate ? (
                    <>🎁 Giảm giá {currentRank.discountRate}% cho mọi đơn hàng</>
                  ) : (
                    <>🎁 Hiện chưa có ưu đãi mua hàng đặc biệt cho hạng thành viên {currentRank?.name}</>
                  )}
                </AlertDescription>
              </Alert>

              {/* Chính sách phục vụ */}
              <Alert>
                <AlertTitle>CHÍNH SÁCH PHỤC VỤ</AlertTitle>
                <AlertDescription>
                  🔒 Hiện chưa có chính sách ưu đãi phục vụ đặc biệt cho hạng thành viên {currentRank?.name}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
