import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { Eye, EyeOff, Lock, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useMutation } from '@/hooks/useMutation'
import { authService } from '@/services/auth.service'
import { ADMIN_PATH } from '@/constants/path'
import type { LoginRequest, AuthResponse } from '@/types/auth.type'

// Schema validation cho form đăng nhập
const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation<AuthResponse>(authService.login, {
    onSuccess: (data) => {
      console.log('Login success:', data)
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      localStorage.setItem('userEmail', data.data.email)
      localStorage.setItem('userRoles', JSON.stringify(data.data.roles))
      
      toast.success('Đăng nhập thành công!')
      navigate(ADMIN_PATH.DASHBOARD)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo và Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Ecommerce
          </h1>
          <p className="text-muted-foreground">
            Admin Panel - Đăng nhập nhân sự
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              Đăng nhập
            </CardTitle>
            <CardDescription>
              Nhập thông tin tài khoản để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="pl-10 h-11"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-10 h-11"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary focus:ring-2"
                  />
                  <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={loginMutation.isLoading}
              >
                {loginMutation.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Cần hỗ trợ? Liên hệ{' '}
                <a href="mailto:support@ecommercewww.com" className="text-primary hover:text-primary/80">
                  support@ecommercewww.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2024 EcommerceWWW. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  )
}
