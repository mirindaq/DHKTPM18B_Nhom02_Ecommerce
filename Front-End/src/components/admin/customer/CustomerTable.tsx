import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Power, PowerOff } from "lucide-react"
import type { CustomerSummary } from "@/types/customer.type"

interface CustomerTableProps {
  customers: CustomerSummary[];
  isLoading: boolean;
  onEdit: (customer: CustomerSummary) => void;
  onDelete: (id: number) => void;
  onViewDetail: (customer: CustomerSummary) => void;
  onToggleStatus: (id: number) => void;  
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN");

export default function CustomerTable({
  customers,
  isLoading,
  onEdit,
 
  onViewDetail,
  onToggleStatus,   
}: CustomerTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Khách hàng</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Tổng chi tiêu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tham gia</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không tìm thấy khách hàng.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-semibold">{customer.fullName}</TableCell>
                <TableCell>
                  <div>{customer.email}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </TableCell>
                <TableCell className="font-medium">{customer.address}</TableCell>
                <TableCell>{formatPrice(customer.totalSpent)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      customer.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {customer.active ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(customer.registerDate)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetail(customer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(customer.id)} 
                    className={`${
                      customer.active
                        ? "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                    }`}
                  >
                    {customer.active ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
