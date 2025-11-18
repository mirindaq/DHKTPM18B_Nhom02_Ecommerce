import React from 'react';
import { Facebook, Youtube, ArrowUp } from 'lucide-react'; 

const ArticleFooter = () => {
    // Hàm cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        // Footer chính: Tông màu tối (dark slate)
        <footer className="bg-[#283038] text-sm text-gray-300 mt-10 border-t border-gray-700 font-sans">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 pt-10">
                
                {/* Cột 1: Logo và Kết nối */}
                <div className="space-y-4">
                    {/* Logo Sforum */}
                    <a href="#" className="flex items-center space-x-1 mb-4">
                        <div className="flex flex-col leading-none">
                            <div className="bg-red-600 text-white px-2 py-1 font-extrabold text-xl rounded-md">
                                S
                            </div>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <div className="font-bold text-xl text-white tracking-wide">forum</div>
                            <div className="text-xs uppercase text-gray-400">MẠNG XÃ HỘI</div>
                        </div>
                    </a>

                    <h3 className="font-semibold text-white mb-3">KẾT NỐI VỚI SFORUM</h3>
                    
                    {/* Social Icons (styled to match the image: light icons with colored backgrounds) */}
                    <div className="flex gap-4 items-center">
                        {/* Facebook (Blue) */}
                        <a href="#" aria-label="Facebook" className="text-white hover:opacity-80 transition-opacity">
                            <Facebook className="w-7 h-7 bg-blue-600 p-1 rounded-full" />
                        </a>
                        
                        {/* TikTok Icon (Black/Dark) - Sử dụng SVG vì Lucide không có icon TikTok mặc định */}
                        <a href="#" aria-label="TikTok" className="text-white hover:opacity-80 transition-opacity">
                            <svg className="w-7 h-7 bg-black p-1 rounded-full" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                        </a>
                        
                        {/* YouTube (Red) */}
                        <a href="#" aria-label="YouTube" className="text-white hover:opacity-80 transition-opacity">
                            <Youtube className="w-7 h-7 bg-red-600 p-1 rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Cột 2: Thông tin & Chính sách Sforum */}
                <div>
                    <h3 className="font-semibold mb-3 text-white">GIỚI THIỆU</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-white transition-colors">Giới thiệu Sforum</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật thông tin người sử dụng</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Thỏa thuận cung cấp và sử dụng dịch vụ</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Cột 3: WEBSITE THÀNH VIÊN - Nhóm 1 */}
                <div>
                    <h3 className="font-semibold mb-2 text-white">WEBSITE THÀNH VIÊN</h3>
                    
                    {/* Cellphone S */}
                    <p className="text-xs text-gray-400 mb-1 mt-4">Hệ thống bán lẻ di động toàn quốc.</p>
                    <a href="#" className="bg-red-600 text-white inline-block px-3 py-1 rounded font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                        cellphone S
                    </a>

                    {/* SChannel */}
                    <p className="text-xs text-gray-400 mb-1 mt-4">Kênh thông tin giải trí công nghệ cho giới trẻ</p>
                    <a href="#" className="bg-red-600 text-white inline-block px-3 py-1 rounded font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                        SChannel
                    </a>
                </div>
                
                {/* Cột 4: WEBSITE THÀNH VIÊN - Nhóm 2 */}
                <div>
                    {/* Ẩn tiêu đề để căn chỉnh với cột 3 */}
                    <h3 className="font-semibold mb-2 text-white opacity-0 pointer-events-none">DỊCH VỤ KHÁC</h3> 
                    
                    {/* dienthoaivui */}
                    <p className="text-xs text-gray-400 mb-1 mt-4">Hệ thống bảo hành sửa chữa Điện thoại - Máy tính.</p>
                    <a href="#" className="bg-red-600 text-white inline-block px-3 py-1 rounded font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                        dienthoaivui
                    </a>

                    {/* care S (Màu xanh dương như trong ảnh) */}
                    <p className="text-xs text-gray-400 mb-1 mt-4">Trung tâm bảo hành ủy quyền Apple</p>
                    <a href="#" className="bg-blue-900 text-white inline-block px-3 py-1 rounded font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                        care S
                    </a>
                </div>
            </div>

            {/* Thanh cuối (Copyright) */}
            <div className="bg-[#1F252B] py-6 text-center text-xs text-gray-400 border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                    <p>
                        © Công Ty TNHH Thương Mại Và Dịch Vụ Kỹ Thuật Diệu Phúc - GPBKKD: 0316172372 do sở KH & ĐT TP. HCM cấp ngày 02/03/2020 - Giấy phép thiết lập MXH số 497/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 17/7/2021 - Địa chỉ: 350-352 Võ Văn Kiệt, Phường Cầu Ông Lãnh, Thành phố Hồ Chí Minh - Điện thoại: 028.7108.9666.
                    </p>
                    <p className="mb-4">
                        Bản quyền nội dung thuộc về Sforum (hoặc Công Ty TNHH Thương Mại Và Dịch Vụ Kỹ Thuật Diệu Phúc). Không được sao chép khi chưa được chấp thuận bằng văn bản.
                    </p>
                    
                    {/* DMCA Badge */}
                    <div className="flex justify-center pt-4">
                        <img 
                            src="https://www.dmca.com/img/dmca-protected-16-m.png" 
                            alt="DMCA Protected" 
                            className="h-10"
                            // Fallback cho ảnh
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/100x40/333333/FFFFFF?text=DMCA+Protected' }}
                        />
                    </div>
                </div>
            </div>
            
            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 bg-white text-slate-800 p-3 rounded shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </footer>
    );
};

export default ArticleFooter;