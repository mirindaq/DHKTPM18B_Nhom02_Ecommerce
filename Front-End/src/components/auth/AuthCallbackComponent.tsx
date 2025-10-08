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
        const response = await authService.socialLoginCallback('google', code);
        
        if (response.data) {
          // Kiểm tra nếu đang trong iframe (modal), gửi message về parent
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              data: response.data.data
            }, window.location.origin);
          } else if (window.opener) {
            // Đóng popup nếu đang trong popup
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              data: response.data.data
            }, window.location.origin);
            // Đóng popup với delay nhỏ để đảm bảo message được gửi
            setTimeout(() => {
              try {
                window.close();
                // Fallback: nếu không đóng được, thử redirect về trang chính
                if (!window.closed) {
                  window.location.href = '/';
                }
              } catch (error) {
                console.error('Không thể đóng popup:', error);
                window.location.href = '/';
              }
            }, 100);
          } else {
            // Hiển thị modal thành công
            setShowSuccessModal(true);
            
            // Tự động chuyển về trang chính sau 2 giây
            setTimeout(() => {
              setShowSuccessModal(false);
              navigate('/');
            }, 2000);
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
      <div className="min-h-screen bg-white flex flex-col">
    
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            {/* Google Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
            </div>

            {/* Loading Spinner */}
            <div className="mb-6">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>

            {/* Text */}
            <h1 className="text-2xl font-normal text-gray-900 mb-2">
              Đang xử lý đăng nhập
            </h1>
            <p className="text-gray-600 text-sm">
              Vui lòng đợi trong giây lát...
            </p>
          </div>
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
