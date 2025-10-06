import { authService } from '@/services/auth.service';
import { useEffect, useState } from 'react';
import {  useNavigate, useSearchParams } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

export default function AuthCallbackComponent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('Không tìm thấy mã xác thực');
        }

        // Gửi code và login_type lên server để xác thực
        const response = await authService.socialLoginCallback('google', code);
        
        if (response.data) {
          // Lưu token và thông tin user
          const { accessToken, refreshToken, email, roles } = response.data.data;
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('userEmail', email)
          localStorage.setItem('userRoles', JSON.stringify(roles))
          
          // Kiểm tra nếu đang trong iframe (modal), gửi message về parent
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              code: code,
              data: response.data.data
            }, window.location.origin);
          } else {
            // Đóng popup nếu đang trong popup
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                code: code,
                data: response.data.data
              }, window.location.origin);
              window.close();
            } else {
              // Hiển thị modal thành công
              setShowSuccessModal(true);
              
              // Tự động chuyển về trang chính sau 2 giây
              setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/admin');
              }, 2000);
            }
          }
        }
      } catch (error: any) {
        console.error('Lỗi xác thực Google:', error);
        
        // Kiểm tra nếu đang trong iframe (modal), gửi message về parent
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.response?.data?.message || 'Đăng nhập thất bại'
          }, window.location.origin);
        } else if (window.opener) {
          // Đóng popup nếu đang trong popup và gửi message lỗi
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.response?.data?.message || 'Đăng nhập thất bại'
          }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>

      {/* Modal thông báo thành công */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
              Đăng nhập thành công!
            </DialogTitle>
            <DialogDescription className="text-center">
              Bạn đã đăng nhập thành công. Đang chuyển về trang chính...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
