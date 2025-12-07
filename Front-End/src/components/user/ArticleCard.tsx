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
            className="cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white group h-full flex flex-col border border-gray-100 hover:border-red-200"
        >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                {/* Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                        {article.category?.title || "Tin tức"}
                    </span>
                </div>
                <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-4 md:p-5 flex-grow flex flex-col">
                <h3
                    className="text-base md:text-lg font-bold text-gray-900 break-words leading-tight line-clamp-3 group-hover:text-red-600 transition-colors mb-3"
                    title={article.title}
                >
                    {article.title}
                </h3>
                
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {article.staffName?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <span className="font-medium text-gray-600">{article.staffName || "Tác giả"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{formatDate(article.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}