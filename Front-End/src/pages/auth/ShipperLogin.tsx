import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Truck,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";
import { authService } from "@/services/auth.service";
import { ADMIN_PATH, SHIPPER_PATH, STAFF_PATH } from "@/constants/path";
import { ROLES, useUser } from "@/context/UserContext";
import AuthStorageUtil from "@/utils/authStorage.util";
import type {
  LoginRequest,
  AuthResponse,
  UserProfile,
} from "@/types/auth.type";

// Schema validation cho form đăng nhập shipper
const shipperLoginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type ShipperLoginFormData = z.infer<typeof shipperLoginSchema>;

export default function ShipperLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipperLoginFormData>({
    resolver: zodResolver(shipperLoginSchema),
    defaultValues: {
      email: "shipper@gmail.com",
      password: "123456",
    },
  });

  const shipperLoginMutation = useMutation<AuthResponse>(
    authService.adminLogin,
    {
      onSuccess: async (data) => {
        try {
          // 1. Lưu tokens trước
          AuthStorageUtil.setTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });

          // 2. Gọi API getProfile để lấy thông tin user đầy đủ
          const profileResponse = await authService.getProfile();

          if (profileResponse.data.status === 200) {
            const userProfile: UserProfile = profileResponse.data.data;

            // 3. Lưu user profile vào localStorage và context
            login(userProfile);

            toast.success("Đăng nhập thành công!");

            // 4. Điều hướng dựa trên role
            if (userProfile.roles.includes(ROLES.ADMIN)) {
              navigate(ADMIN_PATH.DASHBOARD);
            } else if (userProfile.roles.includes(ROLES.STAFF)) {
              navigate(STAFF_PATH.ORDERS);
            } else if (userProfile.roles.includes(ROLES.SHIPPER)) {
              navigate(SHIPPER_PATH.DELIVERIES);
            }
          }
        } catch (error) {
          console.error("Get profile error:", error);
          toast.error("Không thể lấy thông tin người dùng");
          AuthStorageUtil.clearAll();
        }
      },
      onError: (error) => {
        console.error("Shipper login error:", error);
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      },
    }
  );

  const onSubmit = async (data: ShipperLoginFormData) => {
    const loginRequest: LoginRequest = {
      email: data.email,
      password: data.password,
    };

    await shipperLoginMutation.mutate(loginRequest);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex">
      <div className="hidden lg:flex lg:w-3/5 bg-linear-to-br from-green-800 to-green-900 p-12 flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Hệ thống giao hàng{" "}
            <span className="text-green-300">Ecommerce Store</span>
          </h1>
          <p className="text-lg text-gray-100">
            Quản lý và theo dõi các đơn giao hàng của bạn
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Truck className="w-6 h-6 text-green-300 mt-1 shrink-0" />
              <p className="text-white">
                Nhận và giao{" "}
                <span className="font-bold text-green-300">đơn hàng</span> nhanh
                chóng
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-green-300 mt-1 shrink-0" />
              <p className="text-white">
                Theo dõi{" "}
                <span className="font-bold text-green-300">vị trí</span> và
                tuyến đường
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-green-300 mt-1 shrink-0" />
              <p className="text-white">
                Cập nhật{" "}
                <span className="font-bold text-green-300">trạng thái</span>{" "}
                giao hàng
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-green-300 mt-1 shrink-0" />
              <p className="text-white">
                Bảo mật thông tin với{" "}
                <span className="font-bold text-green-300">
                  xác thực an toàn
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <a
              href="#"
              className="text-green-300 font-medium hover:text-green-200"
            >
              Xem hướng dẫn giao hàng &gt;
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-8">
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
            <Truck className="w-32 h-32 text-white/50" />
          </div>
        </div>
      </div>

      {/* Right Section - Shipper Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Đăng nhập Shipper
            </h2>
            <p className="text-gray-600">Dành cho nhân viên giao hàng</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  className="pl-10 h-12 border-gray-300 rounded-lg focus:border-gray-800 focus:ring-gray-800"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="pl-10 pr-10 h-12 border-gray-300 rounded-lg focus:border-gray-800 focus:ring-gray-800"
                  {...register("password")}
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
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Lưu ý giao hàng
                  </p>
                  <p className="text-sm text-green-700">
                    Vui lòng xác nhận trạng thái đơn hàng kịp thời và giữ an
                    toàn hàng hóa.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg"
              disabled={shipperLoginMutation.isLoading}
            >
              {shipperLoginMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            {/* Back to User Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-gray-800 hover:text-gray-700 text-sm font-medium"
              >
                ← Quay lại đăng nhập khách hàng
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Hệ thống giao hàng Ecommerce Store
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">
              © 2024 Ecommerce Store. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
