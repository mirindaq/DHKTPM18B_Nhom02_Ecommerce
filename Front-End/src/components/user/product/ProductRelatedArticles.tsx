import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import type { Article } from "@/types/article.type";
import { PUBLIC_PATH } from "@/constants/path";

interface ProductRelatedArticlesProps {
  articles: Article[];
  isLoading: boolean;
}

export default function ProductRelatedArticles({ articles, isLoading }: ProductRelatedArticlesProps) {
  if (!isLoading && articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tin tức sản phẩm</h2>
          </div>
        </div>
        <Link to={PUBLIC_PATH.NEWS}>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
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
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`${PUBLIC_PATH.HOME}news/article/${article.slug}`}
              className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/avatar.jpg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

