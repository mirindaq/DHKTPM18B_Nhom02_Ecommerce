import { useNavigate } from "react-router"
import { Clock } from "lucide-react"
import type { Article } from "@/types/article.type"
import { PUBLIC_PATH } from "@/constants/path"

interface ArticleCardProps {
    article: Article
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return (
        date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        }) + ` ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
    );
};

export default function ArticleCard({ article }: ArticleCardProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`${PUBLIC_PATH.HOME}news/article/${article.slug}`)
    }

    return (
        <div 
            onClick={handleClick}
            className="group relative overflow-hidden bg-white rounded-sm border border-gray-200 hover:border-red-400 transition-all duration-200 cursor-pointer h-full flex flex-col"
        >
            {/* Article Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200 p-2"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                    }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        {article.category?.title || "Tin tức"}
                    </span>
                </div>
            </div>

            {/* Article Content */}
            <div className="p-4 space-y-2.5 flex-grow flex flex-col">
                {/* Title */}
                <h3
                    className="font-semibold text-lg text-gray-800 line-clamp-2 leading-snug min-h-[3.25rem] group-hover:text-red-600 transition-colors"
                    title={article.title}
                >
                    {article.title}
                </h3>
                
                {/* Author & Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {article.staffName?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <span className="font-medium text-gray-600">{article.staffName || "Tác giả"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{formatDate(article.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}