import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Percent,
  Gift,
  Star,
  CheckCircle,
  Smartphone,
  Laptop,
  Headphones,
} from "lucide-react";
import { USER_PATH } from "@/constants/path";

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  discount: string;
}

const studentBenefits: BenefitItem[] = [
  {
    icon: <Smartphone className="w-8 h-8 text-red-600" />,
    title: "Điện thoại",
    description: "Giảm giá đặc biệt cho sinh viên khi mua điện thoại",
    discount: "Giảm đến 500.000đ",
  },
  {
    icon: <Laptop className="w-8 h-8 text-red-600" />,
    title: "Laptop",
    description: "Ưu đãi khủng dành riêng cho học sinh, sinh viên",
    discount: "Giảm đến 2.000.000đ",
  },
  {
    icon: <Headphones className="w-8 h-8 text-red-600" />,
    title: "Phụ kiện",
    description: "Giảm giá phụ kiện công nghệ cho sinh viên",
    discount: "Giảm 10-20%",
  },
];

const teacherBenefits: BenefitItem[] = [
  {
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    title: "Laptop cho giáo viên",
    description: "Ưu đãi đặc biệt cho giáo viên khi mua laptop",
    discount: "Giảm đến 3.000.000đ",
  },
  {
    icon: <Smartphone className="w-8 h-8 text-blue-600" />,
    title: "Điện thoại",
    description: "Giảm giá cho giáo viên khi mua điện thoại",
    discount: "Giảm đến 800.000đ",
  },
];

const eligibilityRequirements = [
  "Sinh viên đang theo học tại các trường Đại học, Cao đẳng, THPT",
  "Giáo viên đang công tác tại các cơ sở giáo dục",
  "Có thẻ sinh viên/giáo viên còn hiệu lực",
  "Xuất trình CCCD/CMND khi mua hàng",
  "Mỗi khách hàng chỉ được áp dụng 1 lần/năm học",
];

export default function StudentBenefits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(USER_PATH.PROFILE)}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">
              Ưu đãi S-Student và S-Teacher
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Intro Banner */}
        <Card className="mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-4">
                <GraduationCap size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Chương trình S-Student & S-Teacher
                </h2>
                <p className="text-white/90">
                  Ưu đãi độc quyền dành riêng cho học sinh, sinh viên và giáo
                  viên
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Benefits */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
              <Star size={14} className="mr-1" />
              S-Student
            </Badge>
            <h3 className="text-lg font-semibold">Ưu đãi cho Sinh viên</h3>
          </div>
          <div className="grid gap-4">
            {studentBenefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-50 rounded-lg p-3">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {benefit.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-600"
                    >
                      {benefit.discount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Teacher Benefits */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
              <BookOpen size={14} className="mr-1" />
              S-Teacher
            </Badge>
            <h3 className="text-lg font-semibold">Ưu đãi cho Giáo viên</h3>
          </div>
          <div className="grid gap-4">
            {teacherBenefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {benefit.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-600"
                    >
                      {benefit.discount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Gift size={20} />
              Cách nhận ưu đãi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">
                  Đến cửa hàng gần nhất hoặc mua online tại website
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">
                  Chọn sản phẩm có dán nhãn "S-Student" hoặc "S-Teacher"
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">
                  Xuất trình thẻ sinh viên/giáo viên và CCCD để xác thực
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700">
                  Nhận ngay ưu đãi và hoàn tất thanh toán
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle size={20} />
              Điều kiện áp dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {eligibilityRequirements.map((req, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <CheckCircle
                    size={16}
                    className="text-green-600 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-6">
          <CardContent className="py-5 text-center">
            <p className="text-gray-600 mb-3">
              Liên hệ hotline để biết thêm chi tiết về chương trình
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              <Percent size={16} className="mr-2" />
              Hotline: 1900 1234
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
