import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { Eye, EyeOff, Lock, Mail, User, Phone, Calendar, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'
import { useMutation } from '@/hooks/useMutation'
import { authService } from '@/services/auth.service'
import { AUTH_PATH, PUBLIC_PATH } from '@/constants/path'
import { FcGoogle } from "react-icons/fc"
import { useUser } from '@/context/UserContext'
import LocalStorageUtil from '@/utils/localStorage.util'
import type { RegisterRequest, AuthResponse, UserProfile } from '@/types/auth.type'

// Schema validation cho form đăng ký
const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
  phone: z.string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số'),
  email: z.email('Định dạng email không hợp lệ'),

  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function UserRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

          toast.success('Đăng ký thành công!')
          navigate(PUBLIC_PATH.HOME)
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Register error:', event.data.error)
        toast.error(event.data.error || 'Đăng ký thất bại')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigate])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation<AuthResponse>(authService.register, {
    onSuccess: () => {
      toast.success('Đăng ký thành công!')

      navigate(AUTH_PATH.LOGIN_USER)

    },
    onError: (error) => {
      console.error('Register error:', error)
      toast.error('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    const registerRequest: RegisterRequest = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword
    }

    await registerMutation.mutate(registerRequest)
  }

  const handleGoogleRegister = async () => {
    const response = await authService.socialLogin("google")
    if (response.data.data && typeof response.data.data === "string") {
      const popupWidth = 600;
      const popupHeight = 650;

      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      const popupWindow = window.open(
        response.data.data,
        'googleRegister',
        `width=${popupWidth},height=${popupHeight},scrollbars=yes,resizable=yes,location=no,left=${left},top=${top}`
      )

      if (!popupWindow) {
        toast.error('Không thể mở cửa sổ đăng ký. Vui lòng cho phép popup.')
      }
    } else {
      toast.error('Không thể kết nối với Google')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header Section with Mascot */}
      <div className=" py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Đăng ký trở thành <span className="text-red-600">SMEMBER</span>
            </h1>
            <p className="text-lg text-gray-700">
              Để không bỏ lỡ các ưu đãi hấp dẫn từ Ecommerce Store
            </p>
          </div>

          {/* Mascot Character */}
          <div className="flex justify-center">
            <img
              src={"/assets/backgroundLogin.png"}
              alt={"backgroundLogin"}
              className="w-32 h-32 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/assets/backgroundLogin.png"
              }}
            />
          </div>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">

          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Social Media Registration */}
            <div className="space-y-4">
              <h3 className="text-center text-gray-700 font-medium">
                Đăng ký bằng tài khoản mạng xã hội
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleRegister}
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Hoặc điền thông tin sau
                </span>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên"
                        className="pl-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        {...register('fullName')}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        className="pl-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                      Ngày sinh
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                      <DatePicker
                        id="dateOfBirth"
                        value={watch('dateOfBirth')}
                        onChange={(value) => setValue('dateOfBirth', value)}
                        placeholder="dd/MM/yyyy"
                        className="pl-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Nhập email"
                        className="pl-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        {...register('email')}
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Hóa đơn VAT khi mua hàng sẽ được gửi qua email này</span>
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tạo mật khẩu</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu của bạn"
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
                  <div className="flex items-start space-x-2 text-sm text-gray-500">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-xs">i</span>
                    </div>
                    <span>Mật khẩu tối thiểu 6 ký tự</span>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                {/* Right Column - Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu của bạn"
                      className="pl-10 pr-10 h-12 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>


            </div>


            {/* Spacer for sticky buttons */}
            <div className="h-20"></div>
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
      </div >

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg" >
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
            onClick={() => navigate(AUTH_PATH.LOGIN_USER)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại đăng nhập
          </Button>
          <Button
            type="submit"
            form="register-form"
            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang đăng ký...</span>
              </div>
            ) : (
              'Hoàn tất đăng ký'
            )}
          </Button>
        </div>
      </div>
    </div >
  )
}
