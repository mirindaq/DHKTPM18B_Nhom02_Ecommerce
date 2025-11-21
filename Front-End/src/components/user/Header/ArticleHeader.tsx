import { Search, User } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router";
import { PUBLIC_PATH } from "@/constants/path";
import LoginModal from "../LoginModal";


const ArticleHeader = () => {
    const { isAuthenticated, user } = useUser();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const cartTimeoutRef = useRef(null);


    // Cleanup timeout khi component unmount
    useEffect(() => {
        return () => {
            if (cartTimeoutRef.current) {
                clearTimeout(cartTimeoutRef.current);
            }
        };
    }, []);


    // Shared button style for consistency
    const redButtonStyle =
        "flex items-center space-x-2 bg-[#AC0014] hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors";

    return (
        <header className="bg-[#D70018] text-white py-2 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 space-x-4">
                
                {/* Logo - Đã chỉnh sửa để phù hợp với font và style của Header */}
                <a href={PUBLIC_PATH.HOME} className="flex items-center space-x-1 hover:opacity-90 transition-opacity">
                    <div className="flex flex-col leading-none">
                        <div className="bg-white text-red-600 px-2 py-1 font-extrabold text-xl rounded-md">
                            S
                        </div>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <div className="font-bold text-xl tracking-wide">forum</div>
                        <div className="text-xs uppercase opacity-80">MẠNG XÃ HỘI</div>
                    </div>
                </a>


                {/* Thanh tìm kiếm - Giữ nguyên style của Header */}
                <div className="flex-1 max-w-xl">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                navigate(`/sforum/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                        className="flex items-center bg-white rounded-lg px-3 py-2 text-gray-700 h-10"
                    >
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết, tin tức..."
                            className="flex-1 bg-transparent outline-none ml-2 text-sm placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* User Account - Giữ nguyên style của Header */}
                {isAuthenticated && user ? (
                    <button
                        className={redButtonStyle}
                        onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
                    >
                        <User size={24} />
                        <div className="text-left">
                            <span className="block text-sm font-semibold">{user.name}</span>
                            <span className="block text-xs">Tài khoản</span>
                        </div>
                    </button>
                ) : (
                    <button
                        className={redButtonStyle}
                        onClick={() => setShowLoginModal(true)}
                    >
                        <User size={24} />
                        <div className="text-left">
                            <span className="block text-sm font-semibold">Đăng nhập</span>
                            <span className="block text-xs">Đăng ký</span>
                        </div>
                    </button>
                )}
            </div>
            
            {/* Login Modal */}
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </header>
    );
};

export default ArticleHeader;