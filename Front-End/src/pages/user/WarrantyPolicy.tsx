import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
} from "lucide-react";
import { USER_PATH } from "@/constants/path";

interface WarrantyItem {
  icon: React.ReactNode;
  title: string;
  items: string[];
  bgColor: string;
}

const warrantyCategories: WarrantyItem[] = [
  {
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    title: "Các trường hợp được bảo hành",
    bgColor: "bg-green-50",
    items: [
      "Lỗi kỹ thuật do nhà sản xuất",
      "Lỗi phần cứng trong điều kiện sử dụng bình thường",
      "Pin chai dưới 80% trong thời gian bảo hành",
      "Màn hình có điểm chết hoặc lỗi hiển thị",
      "Loa, mic, cảm ứng không hoạt động đúng chức năng",
      "Camera bị mờ, không lấy nét được",
    ],
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    title: "Điều kiện bảo hành",
    bgColor: "bg-amber-50",
    items: [
      "Sản phẩm còn trong thời hạn bảo hành",
      "Tem bảo hành và số serial còn nguyên vẹn",
      "Có hóa đơn mua hàng hợp lệ",
      "Sản phẩm chưa qua sửa chữa bởi bên thứ ba",
      "Mang theo phụ kiện đi kèm (nếu có)",
      "Sao lưu dữ liệu trước khi gửi bảo hành",
    ],
  },
  {
    icon: <XCircle className="w-6 h-6 text-red-600" />,
    title: "Các trường hợp không được bảo hành",
    bgColor: "bg-red-50",
    items: [
      "Hư hỏng do rơi vỡ, va đập, ngấm nước",
      "Tự ý tháo lắp, sửa chữa sản phẩm",
      "Sử dụng sai hướng dẫn, quá tải",
      "Hư hỏng do thiên tai, hỏa hoạn, sét đánh",
      "Tem bảo hành bị rách, mờ hoặc thay đổi",
      "Sản phẩm hết thời hạn bảo hành",
      "Lỗi phần mềm do cài đặt ứng dụng bên ngoài",
    ],
  },
];

const warrantyDuration = [
  { product: "Điện thoại", duration: "12 tháng" },
  { product: "Máy tính bảng", duration: "12 tháng" },
  { product: "Laptop", duration: "24 tháng" },
  { product: "Tai nghe", duration: "6 tháng" },
  { product: "Sạc, cáp", duration: "6 tháng" },
  { product: "Ốp lưng, phụ kiện khác", duration: "1 tháng" },
];

export default function WarrantyPolicy() {
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
            <h1 className="text-xl font-semibold">Chính sách bảo hành</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Intro Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Package size={24} />
              Cam kết bảo hành chính hãng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi cam kết tất cả sản phẩm được bán tại hệ thống đều là
              hàng chính hãng 100% và được bảo hành theo đúng chính sách của nhà
              sản xuất. Khách hàng có thể yên tâm mua sắm và sử dụng sản phẩm
              với dịch vụ bảo hành uy tín.
            </p>
          </CardContent>
        </Card>

        {/* Warranty Duration Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              Thời gian bảo hành theo loại sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">
                      Loại sản phẩm
                    </th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">
                      Thời gian bảo hành
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyDuration.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-2 px-3 text-gray-800">
                        {item.product}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-red-600">
                        {item.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Warranty Categories */}
        <div className="space-y-4">
          {warrantyCategories.map((category, index) => (
            <Card key={index} className={category.bgColor}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {category.icon}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="text-gray-700 text-sm flex gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Card */}
        <Card className="mt-6 bg-blue-50">
          <CardContent className="py-5">
            <div className="text-center space-y-2">
              <p className="font-semibold text-blue-800">
                Hotline hỗ trợ bảo hành: 1900 1234
              </p>
              <p className="text-blue-700 text-sm">
                Thời gian làm việc: 8:00 - 21:00 (Tất cả các ngày trong tuần)
              </p>
              <p className="text-blue-600 text-sm">
                Email: warranty@ecommerce.vn
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
