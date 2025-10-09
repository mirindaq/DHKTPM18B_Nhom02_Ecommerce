export default function Footer() {
  return (
    <footer className="bg-gray-100 text-sm text-gray-700 mt-10 border-t">
      <div className="container grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto flex items-center justify-between pb-6 pt-10 space-x-4">
        {/* Cột 1 */}
        <div>
          <h3 className="font-semibold mb-2">Tổng đài hỗ trợ miễn phí</h3>
          <p>Mua hàng - bảo hành <strong>1800.2097</strong> (7h30 - 22h00)</p>
          <p>Khiếu nại <strong>1800.2063</strong> (8h00 - 21h30)</p>

          <h3 className="font-semibold mt-4 mb-2">Phương thức thanh toán</h3>
          <div className="flex flex-wrap gap-2">
            <img src="/images/pay/applepay.png" alt="Apple Pay" className="h-6" />
            <img src="/images/pay/vnpay.png" alt="VNPay" className="h-6" />
            <img src="/images/pay/momo.png" alt="MoMo" className="h-6" />
            <img src="/images/pay/visa.png" alt="Visa" className="h-6" />
            {/* ... thêm logo khác */}
          </div>

          <h3 className="font-semibold mt-4 mb-2">Đăng ký nhận tin khuyến mãi</h3>
          <p className="text-red-500 text-sm">Nhận ngay voucher 10%</p>
          <form className="flex flex-col gap-2 mt-2">
            <input type="email" placeholder="Nhập email của bạn" className="border p-2 rounded" />
            <input type="tel" placeholder="Nhập số điện thoại của bạn" className="border p-2 rounded" />
            <label className="flex items-center text-xs">
              <input type="checkbox" className="mr-2" /> Tôi đồng ý với điều khoản của CellphoneS
            </label>
            <button className="bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700">
              Đăng ký ngay
            </button>
          </form>
        </div>

        {/* Cột 2 */}
        <div>
          <h3 className="font-semibold mb-2">Thông tin và chính sách</h3>
          <ul className="space-y-1">
            <li>Mua hàng và thanh toán Online</li>
            <li>Mua hàng trả góp Online</li>
            <li>Chính sách giao hàng</li>
            <li>Chính sách bảo hành</li>
            <li>Chính sách đổi trả</li>
            <li>VAT Refund</li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h3 className="font-semibold mb-2">Dịch vụ và thông tin khác</h3>
          <ul className="space-y-1">
            <li>Khách hàng doanh nghiệp (B2B)</li>
            <li>Ưu đãi thanh toán</li>
            <li>Tuyển dụng</li>
            <li>Dịch vụ bảo hành mở rộng</li>
          </ul>
          <h3 className="font-semibold mt-4 mb-2">Mua sắm dễ dàng</h3>
          <div className="flex gap-2">
            <img src="/images/qrcode.png" alt="QR" className="h-20" />
            <div className="flex flex-col gap-2">
              <img src="/images/googleplay.png" alt="Google Play" className="h-8" />
              <img src="/images/appstore.png" alt="App Store" className="h-8" />
            </div>
          </div>
        </div>

        {/* Cột 4 */}
        <div>
          <h3 className="font-semibold mb-2">Kết nối với CellphoneS</h3>
          <div className="flex gap-2 mb-4">
            <img src="/images/social/youtube.png" alt="YouTube" className="h-6" />
            <img src="/images/social/facebook.png" alt="Facebook" className="h-6" />
            <img src="/images/social/instagram.png" alt="Instagram" className="h-6" />
          </div>
          <h3 className="font-semibold mb-2">Website thành viên</h3>
          <ul className="space-y-1">
            <li className="text-red-600 font-bold">dienthoaivui</li>
            <li>careS</li>
            <li>SChannel</li>
            <li>Sforum.vn</li>
          </ul>
        </div>
      </div>

      {/* Thanh cuối */}
      <div className="bg-gray-200 py-4 text-center text-xs">
        <p className="mb-2">
          iPhone Air | iPhone 17 | iPhone 17 Pro | Điện thoại iPhone | Samsung Galaxy ...
        </p>
        <p>Công ty TNHH Thương Mại và Dịch Vụ Kỹ Thuật ĐIỆU PHÚC - GPDKKD: 0316172372 ...</p>
      </div>
    </footer>
  )
}
