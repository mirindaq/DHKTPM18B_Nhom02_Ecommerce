import { useNavigate } from "react-router"
import type { Article } from "@/types/article.type"
import { PUBLIC_PATH } from "@/constants/path"

interface ArticleCardProps {
    article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`${PUBLIC_PATH.HOME}article/${article.slug}`)
    }

    return (
        <div 
            onClick={handleClick}
            className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 bg-white group h-full flex flex-col" // <-- Đã đổi thành rounded-lg
        >
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <div
                className="p-3 flex-grow flex flex-col justify-end"
            >
                <h3
                    className="text-base font-medium text-gray-800 break-words leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors"
                    title={article.title}
                >
                    {article.title}
                </h3>
            </div>
        </div>
    )
}