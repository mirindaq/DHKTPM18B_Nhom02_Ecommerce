import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TermSection {
  title: string;
  content: string[];
}

const termsSections: TermSection[] = [
  {
    title: "1. Giới thiệu",
    content: [
      "Chào mừng bạn đến với ứng dụng của chúng tôi. Khi sử dụng ứng dụng này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.",
      "Vui lòng đọc kỹ các điều khoản này trước khi sử dụng bất kỳ dịch vụ nào của chúng tôi.",
    ],
  },
  {
    title: "2. Điều kiện sử dụng",
    content: [
      "Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản và thực hiện giao dịch mua hàng.",
      "Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.",
      "Mọi hoạt động dưới tài khoản của bạn sẽ được coi là do bạn thực hiện.",
    ],
  },
  {
    title: "3. Quyền sở hữu trí tuệ",
    content: [
      "Tất cả nội dung trên ứng dụng bao gồm văn bản, hình ảnh, logo, biểu tượng đều thuộc quyền sở hữu của chúng tôi.",
      "Bạn không được sao chép, phân phối hoặc sử dụng bất kỳ nội dung nào mà không có sự đồng ý bằng văn bản của chúng tôi.",
    ],
  },
  {
    title: "4. Chính sách bảo mật",
    content: [
      "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo quy định của pháp luật.",
      "Thông tin của bạn chỉ được sử dụng cho mục đích cung cấp dịch vụ và không được chia sẻ cho bên thứ ba.",
      "Bạn có quyền yêu cầu xóa hoặc chỉnh sửa thông tin cá nhân bất cứ lúc nào.",
    ],
  },
  {
    title: "5. Thanh toán và giao dịch",
    content: [
      "Tất cả giá cả được hiển thị bằng Việt Nam Đồng (VNĐ) và đã bao gồm thuế.",
      "Chúng tôi chấp nhận nhiều phương thức thanh toán bao gồm COD, chuyển khoản, ví điện tử.",
      "Đơn hàng chỉ được xác nhận sau khi thanh toán thành công hoặc xác nhận COD.",
    ],
  },
  {
    title: "6. Đổi trả và hoàn tiền",
    content: [
      "Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu còn nguyên seal và hóa đơn.",
      "Hoàn tiền sẽ được thực hiện trong vòng 5-7 ngày làm việc sau khi yêu cầu được chấp nhận.",
      "Phí vận chuyển hoàn trả sẽ do bên vi phạm chịu.",
    ],
  },
  {
    title: "7. Giới hạn trách nhiệm",
    content: [
      "Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp nào phát sinh từ việc sử dụng dịch vụ.",
      "Trong trường hợp có tranh chấp, trách nhiệm của chúng tôi sẽ không vượt quá giá trị đơn hàng.",
    ],
  },
  {
    title: "8. Thay đổi điều khoản",
    content: [
      "Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào.",
      "Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng dụng.",
      "Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
    ],
  },
];

export default function TermsOfUse() {
  return (
    <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <FileText size={24} />
              Điều khoản và Điều kiện sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {termsSections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-gray-600 text-sm leading-relaxed flex gap-2"
                    >
                      <span className="text-red-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="py-5">
            <p className="text-center text-gray-500 text-sm">
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên
              hệ với chúng tôi qua email:{" "}
              <a
                href="mailto:support@ecommerce.vn"
                className="text-red-600 hover:underline"
              >
                support@ecommerce.vn
              </a>
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
