import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { Eye, EyeOff, Lock, Mail, Gift, Truck, Star, CreditCard, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMutation } from '@/hooks/useMutation'
import { authService } from '@/services/auth.service'
import { AUTH_PATH, PUBLIC_PATH } from '@/constants/path'
import { FcGoogle } from "react-icons/fc"
import { useUser } from '@/context/UserContext'
import LocalStorageUtil from '@/utils/localStorage.util'
import type { LoginRequest, AuthResponse, UserProfile } from '@/types/auth.type'

// Schema validation cho form đăng nhập
const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function UserLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useUser()

  // Lắng nghe message từ popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { data } = event.data
        if (data) {
          const { accessToken, refreshToken, email, roles } = data

          const userProfile: UserProfile = {
            id: email,
            email: email,
            name: email.split('@')[0],
            roles: roles,
          }

          // Lưu token và data cùng lúc
          LocalStorageUtil.setTokensAndData({ accessToken, refreshToken }, userProfile)

          // Sử dụng UserContext để login
          login(userProfile)

          toast.success('Đăng nhập thành công!')
          navigate(PUBLIC_PATH.HOME)
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Login error:', event.data.error)
        toast.error(event.data.error || 'Đăng nhập thất bại')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation<AuthResponse>(authService.login, {
    onSuccess: (data) => {
      const userProfile: UserProfile = {
        id: data.data.email,
        email: data.data.email,
        name: data.data.email.split('@')[0],
        roles: data.data.roles,
      }

      LocalStorageUtil.setTokensAndData({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken
      }, userProfile)

      login(userProfile)

      toast.success('Đăng nhập thành công!')

      navigate(PUBLIC_PATH.HOME)

    },
    onError: (error) => {
      console.error('Login error:', error)
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    const loginRequest: LoginRequest = {
      email: data.email,
      password: data.password
    }

    await loginMutation.mutate(loginRequest)
  }

  const handleGoogleLogin = async () => {
    const response = await authService.socialLogin("google")
    if (response.data.data && typeof response.data.data === "string") {
      const popupWidth = 600;
      const popupHeight = 650;

      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      const popupWindow = window.open(
        response.data.data,
        'googleLogin',
        `width=${popupWidth},height=${popupHeight},scrollbars=yes,resizable=yes,location=no,left=${left},top=${top}`
      )

      if (!popupWindow) {
        toast.error('Không thể mở cửa sổ đăng nhập. Vui lòng cho phép popup.')
      }
    } else {
      toast.error('Không thể kết nối với Google')
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-red-50 to-orange-50 p-12 flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Nhập hội khách hàng thành viên <span className="text-red-600">ECOMEMBER</span>
          </h1>
          <p className="text-lg text-gray-700">
            Để không bỏ lỡ các ưu đãi hấp dẫn từ Ecommerce Store
          </p>
        </div>

        <div className="bg-white rounded-2xl border-red-200 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Gift className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Chiết khấu đến <span className="font-bold text-red-600">5%</span> khi mua các sản phẩm tại Ecommerce Store
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Truck className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Miễn phí giao hàng cho thành viên ECOM, EVIP và cho đơn hàng từ <span className="font-bold text-red-600">300.000₫</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Trợ giá thu cũ lên đời đến <span className="font-bold text-red-600">1 triệu</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Thăng hạng nhận voucher đến <span className="font-bold text-red-600">300.000₫</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <p className="text-gray-800">
                Đặc quyền E-Student/E-Teacher ưu đãi thêm đến <span className="font-bold text-red-600">10%</span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <a href="#" className="text-red-600 font-medium hover:text-red-700">
              Xem chi tiết chính sách ưu đãi Ecomember &gt;
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center">
          <img
            src={"/assets/backgroundLogin.png"}
            alt={"backgroundLogin"}
            className="w-100 h-100 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/assets/backgroundLogin.png"
            }}
          />
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-2">
              Đăng nhập ECOMEMBER
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="pl-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className="pl-10 pr-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Seamless Login Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Trải nghiệm đăng nhập liền mạch giữa Ecommerce Store và các đối tác, ưu tiên dùng tài khoản Ecommerce (nếu có)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Social Login */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Hoặc đăng nhập bằng
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleLogin}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-gray-300 hover:bg-gray-50"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                  Zalo
                </Button>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Bạn chưa có tài khoản?{' '}
                <button onClick={() => navigate(AUTH_PATH.REGISTER_USER)} className="hover:cursor-pointer text-red-600 font-medium hover:text-red-700">
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Mua sắm, sửa chữa tại{' '}
              <a href="#" className="text-red-600 hover:text-red-700">
                ecommerce.com.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
