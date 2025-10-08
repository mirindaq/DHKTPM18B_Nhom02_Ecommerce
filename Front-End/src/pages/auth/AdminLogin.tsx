import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { Eye, EyeOff, Lock, Mail, Shield, Users, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMutation } from '@/hooks/useMutation'
import { authService } from '@/services/auth.service'
import { ADMIN_PATH, SHIPPER_PATH, STAFF_PATH } from '@/constants/path'
import { ROLES, useUser } from '@/context/UserContext'
import LocalStorageUtil from '@/utils/localStorage.util'
import type { LoginRequest, AuthResponse, UserProfile } from '@/types/auth.type'

// Schema validation cho form đăng nhập admin
const adminLoginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })

  const adminLoginMutation = useMutation<AuthResponse>(authService.adminLogin, {
    onSuccess: (data) => {
      // Tạo user profile từ response
      const userProfile: UserProfile = {
        id: data.data.email, // Tạm thời dùng email làm ID
        email: data.data.email,
        name: data.data.email.split('@')[0], // Tạm thời dùng phần trước @ làm tên
        roles: data.data.roles,
      }

      LocalStorageUtil.setTokensAndData({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken
      }, userProfile)

      login(userProfile)

      toast.success('Đăng nhập admin thành công!')

      if (data.data.roles.includes(ROLES.ADMIN)) {
        navigate(ADMIN_PATH.DASHBOARD)
      } else if (data.data.roles.includes(ROLES.STAFF)) {
        navigate(STAFF_PATH.DASHBOARD)
      } else if (data.data.roles.includes(ROLES.SHIPPER)) {
        navigate(SHIPPER_PATH.DASHBOARD)
      }
    },
    onError: (error) => {
      console.error('Admin login error:', error)
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    const loginRequest: LoginRequest = {
      email: data.email,
      password: data.password
    }

    await adminLoginMutation.mutate(loginRequest)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-800 to-indigo-800 p-12 flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Hệ thống quản trị <span className="text-yellow-300">Ecommerce Store</span>
          </h1>
          <p className="text-lg text-blue-100">
            Quản lý toàn bộ hoạt động kinh doanh và vận hành cửa hàng
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
              <p className="text-white">
                Theo dõi và phân tích <span className="font-bold text-yellow-300">doanh thu</span> và hiệu suất bán hàng
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
              <p className="text-white">
                Quản lý <span className="font-bold text-yellow-300">khách hàng</span> và đơn hàng hiệu quả
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
              <p className="text-white">
                Bảo mật cao với <span className="font-bold text-yellow-300">xác thực 2 lớp</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
              <p className="text-white">
                Tùy chỉnh hệ thống và <span className="font-bold text-yellow-300">tích hợp API</span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <a href="#" className="text-yellow-300 font-medium hover:text-yellow-200">
              Xem hướng dẫn sử dụng hệ thống &gt;
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-8">
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
            <Shield className="w-32 h-32 text-white/50" />
          </div>
        </div>
      </div>

      {/* Right Section - Admin Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-2">
              Đăng nhập Admin
            </h2>
            <p className="text-gray-600">
              Chỉ dành cho quản trị viên hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email admin"
                  className="pl-10 h-12 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-blue-800"
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
                  placeholder="Nhập mật khẩu admin"
                  className="pl-10 pr-10 h-12 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-blue-800"
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

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Bảo mật hệ thống
                  </p>
                  <p className="text-sm text-blue-700">
                    Chỉ sử dụng tài khoản admin được cấp quyền. Mọi hoạt động đều được ghi log.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-800 hover:bg-blue-700 text-white font-medium rounded-lg"
              disabled={adminLoginMutation.isLoading}
            >
              {adminLoginMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập Admin'
              )}
            </Button>

            {/* Back to User Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                  className="text-blue-800 hover:text-blue-700 text-sm font-medium"
              >
                ← Quay lại đăng nhập khách hàng
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Hệ thống quản trị Ecommerce Store
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">
              © 2024 Ecommerce Store. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
