import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  Wrench,
} from "lucide-react";

interface PolicyItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const policyItems: PolicyItem[] = [
  {
    icon: <Shield className="w-6 h-6 text-red-600" />,
    title: "Bảo hành chính hãng",
    description:
      "Tất cả sản phẩm điện thoại, máy tính bảng được bảo hành theo đúng chính sách của nhà sản xuất. Thời gian bảo hành từ 12-24 tháng tùy theo từng sản phẩm.",
  },
  {
    icon: <Clock className="w-6 h-6 text-red-600" />,
    title: "Thời gian bảo hành",
    description:
      "Điện thoại: 12 tháng. Máy tính bảng: 12 tháng. Phụ kiện: 6 tháng. Thời gian bảo hành được tính từ ngày mua hàng ghi trên hóa đơn.",
  },
  {
    icon: <Wrench className="w-6 h-6 text-red-600" />,
    title: "Dịch vụ sửa chữa",
    description:
      "Chúng tôi cung cấp dịch vụ sửa chữa nhanh chóng và uy tín. Đội ngũ kỹ thuật viên giàu kinh nghiệm, linh kiện chính hãng, bảo hành sau sửa chữa.",
  },
  {
    icon: <MapPin className="w-6 h-6 text-red-600" />,
    title: "Địa điểm bảo hành",
    description:
      "Quý khách có thể mang sản phẩm đến bất kỳ cửa hàng nào trong hệ thống hoặc gửi về trung tâm bảo hành chính thức. Hỗ trợ ship 2 chiều cho khách hàng ở xa.",
  },
  {
    icon: <Phone className="w-6 h-6 text-red-600" />,
    title: "Hotline hỗ trợ",
    description:
      "Hotline: 1900 1234 (8:00 - 21:00 tất cả các ngày). Đội ngũ tư vấn viên sẵn sàng giải đáp mọi thắc mắc về bảo hành và sửa chữa.",
  },
  {
    icon: <Mail className="w-6 h-6 text-red-600" />,
    title: "Liên hệ qua email",
    description:
      "Email: support@ecomstore.vn. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.",
  },
];

export default function GuaranteePolicy() {
  return (
    <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Chính sách bảo hành</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi cam kết mang đến cho khách hàng dịch vụ bảo hành và sửa
              chữa chất lượng cao với đội ngũ kỹ thuật viên chuyên nghiệp và
              trang thiết bị hiện đại. Mọi sản phẩm được bảo hành đều tuân thủ
              theo chính sách của nhà sản xuất.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {policyItems.map((item, index) => (
            <Card key={index}>
              <CardContent className="py-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-amber-600">Lưu ý quan trọng</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
              <li>
                Sản phẩm bảo hành phải còn tem bảo hành và số serial nguyên vẹn
              </li>
              <li>
                Không bảo hành các trường hợp hư hỏng do người dùng gây ra
              </li>
              <li>Không bảo hành sản phẩm đã qua sửa chữa bởi bên thứ ba</li>
              <li>
                Không bảo hành các lỗi phần mềm do cài đặt ứng dụng bên ngoài
              </li>
              <li>Vui lòng sao lưu dữ liệu trước khi gửi sản phẩm bảo hành</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
