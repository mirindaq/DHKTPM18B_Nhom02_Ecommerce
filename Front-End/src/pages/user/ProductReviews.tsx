import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronRight, ChevronLeft, User } from "lucide-react";
import { productService } from "@/services/product.service";
import { feedbackService } from "@/services/feedback.service";
import { PUBLIC_PATH } from "@/constants/path";
import type { Feedback, RatingStatistics } from "@/types/feedback.type";
import { useQuery } from "@/hooks/useQuery";

export default function ProductReviews() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const pageSize = 10;

  // Load product data
  const { data: productData, isLoading: productLoading } = useQuery(
    () => productService.getProductBySlug(slug!),
    {
      queryKey: ["product", slug || ""],
      enabled: !!slug,
    }
  );

  const product = productData?.data || null;

  // Load rating statistics
  const { data: statisticsData, isLoading: statisticsLoading } = useQuery(
    () => feedbackService.getRatingStatistics(product?.id || 0),
    {
      queryKey: ["product-statistics", product?.id?.toString() || ""],
      enabled: !!product?.id,
    }
  );

  // Load feedbacks with pagination
  const { data: feedbacksData, isLoading: feedbacksLoading } = useQuery(
    () =>
      feedbackService.getFeedbacksByProduct(
        product?.id || 0,
        currentPage,
        pageSize,
        ratingFilter || undefined
      ),
    {
      queryKey: [
        "product-feedbacks-page",
        product?.id?.toString() || "",
        currentPage.toString(),
        ratingFilter?.toString() || "all",
      ],
      enabled: !!product?.id,
    }
  );

  const feedbacks: Feedback[] = feedbacksData?.data?.content || [];
  const totalElements = feedbacksData?.data?.totalElements || 0;
  const totalPages = feedbacksData?.data?.totalPages || 1;
  const statistics: RatingStatistics | null = statisticsData?.data || null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRatingFilterChange = (rating: number | null) => {
    setRatingFilter(rating);
    setCurrentPage(1);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Không tìm thấy sản phẩm
            </h2>
            <Button
              onClick={() => navigate(PUBLIC_PATH.HOME)}
              className="w-full"
            >
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to={PUBLIC_PATH.HOME}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              to={`${PUBLIC_PATH.HOME}product/${slug}`}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              {product.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Đánh giá</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Đánh giá & nhận xét {product.name}
          </h1>
          <Link
            to={`${PUBLIC_PATH.HOME}product/${slug}`}
            className="text-red-600 hover:underline text-sm"
          >
            <ChevronLeft className="w-4 h-4 inline" /> Quay lại trang sản phẩm
          </Link>
        </div>

        {/* Rating Summary */}
        {statisticsLoading ? (
          <Skeleton className="h-32 w-full mb-6" />
        ) : statistics && statistics.totalReviews > 0 ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-8">
                {/* Average Rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-red-600">
                    {statistics.averageRating}
                  </div>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(statistics.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {statistics.totalReviews} đánh giá
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                  {[
                    { stars: 5, count: statistics.fiveStarCount },
                    { stars: 4, count: statistics.fourStarCount },
                    { stars: 3, count: statistics.threeStarCount },
                    { stars: 2, count: statistics.twoStarCount },
                    { stars: 1, count: statistics.oneStarCount },
                  ].map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12 text-sm text-gray-600">
                        {stars} sao
                      </span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{
                            width: `${
                              statistics.totalReviews > 0
                                ? (count / statistics.totalReviews) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="w-10 text-sm text-gray-500 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Rating Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={ratingFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleRatingFilterChange(null)}
            className={
              ratingFilter === null ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            Tất cả ({statistics?.totalReviews || 0})
          </Button>
          {statistics &&
            [5, 4, 3, 2, 1].map((rating) => {
              const counts: Record<number, number> = {
                5: statistics.fiveStarCount,
                4: statistics.fourStarCount,
                3: statistics.threeStarCount,
                2: statistics.twoStarCount,
                1: statistics.oneStarCount,
              };
              return (
                <Button
                  key={rating}
                  variant={ratingFilter === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRatingFilterChange(rating)}
                  className={
                    ratingFilter === rating ? "bg-red-600 hover:bg-red-700" : ""
                  }
                >
                  {rating}{" "}
                  <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />{" "}
                  ({counts[rating]})
                </Button>
              );
            })}
        </div>

        {/* Feedbacks List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {totalElements} đánh giá{" "}
              {ratingFilter ? `(${ratingFilter} sao)` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacksLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  Không có đánh giá nào{" "}
                  {ratingFilter ? `với ${ratingFilter} sao` : ""}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="text-red-600 font-semibold text-lg">
                          {feedback.customerName?.charAt(0)?.toUpperCase() || (
                            <User className="w-5 h-5" />
                          )}
                        </span>
                      </div>

                      <div className="flex-1">
                        {/* Name and Rating */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {feedback.customerName}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= feedback.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-500 mb-2">
                          {feedback.createdAt
                            ? new Date(feedback.createdAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </div>

                        {/* Comment */}
                        {feedback.comment && (
                          <p className="text-gray-700 mb-2">
                            {feedback.comment}
                          </p>
                        )}

                        {/* Images */}
                        {feedback.imageUrls &&
                          feedback.imageUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {feedback.imageUrls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Review image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(url, "_blank")}
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, arr) => {
                    const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            currentPage === page
                              ? "bg-red-600 hover:bg-red-700"
                              : ""
                          }
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
