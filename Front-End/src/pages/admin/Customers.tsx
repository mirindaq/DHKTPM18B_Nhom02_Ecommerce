import type { CustomerDetail, UpdateCustomerProfileRequest, CustomerSummary, CustomerListResponse, CreateCustomerRequest, MostPurchasedProduct, Order } from "@/types/customer.type";
import { customerService } from "@/services/customer.service";
import Pagination from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Search, Eye, Plus, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "@/hooks"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Gender } from "@/types/customer.type";

export default function Customers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(7)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [viewingCustomer, setViewingCustomer] = useState<CustomerSummary | null>(null);

  const initialFormData: CreateCustomerRequest = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    registerDate: new Date(), // Mặc định là ngày hôm nay
  }
  const [formData, setFormData] = useState<Partial<CreateCustomerRequest & UpdateCustomerProfileRequest>>({})

  // Cập nhật useEffect 
  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        fullName: editingCustomer.fullName,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
        dateOfBirth: editingCustomer.dateOfBirth ? new Date(editingCustomer.dateOfBirth) : null,
        gender: editingCustomer.gender,
        avatar: editingCustomer.avatar,
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        registerDate: new Date(),
      });
    }
  }, [editingCustomer, isDialogOpen]);
  // Hàm cập nhật state của form
  const handleFormChange = (field: keyof CreateCustomerRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  // Sửa lại useQuery 
  const {
    data: customersData,
    isLoading: isLoadingCustomer,
    refetch: refetchCustomers,
  } = useQuery<CustomerListResponse>(
    () => {
      let statusParam = '';
      if (statusFilter === 'active') {
        statusParam = 'true';
      } else if (statusFilter === 'inactive') {
        statusParam = 'false';
      }
      return customerService.getCustomers(
        currentPage,
        pageSize,
        searchTerm,
        statusParam
      );
    },
    {
      queryKey: ["customers", currentPage.toString(), pageSize.toString(), searchTerm, statusFilter],
    }
  );

  const pagination = customersData?.data;

  const customers = customersData?.data?.data || []
  // Toggle brand status
  const toggleStatusMutation = useMutation(
    (id: number) => customerService.changeStatusCustomer(id),
    {
      onSuccess: () => {
        toast.success('Thay đổi trạng thái thành công')
        refetchCustomers()
      },
      onError: (error) => {
        console.error('Error toggling brand status:', error)
        toast.error('Không thể thay đổi trạng thái thương hiệu')
      }
    }
  )
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  // Create
  const createCustomerMutation = useMutation(
    (data: CreateCustomerRequest) => customerService.createCustomer(data),
    {
      onSuccess: () => {
        toast.success("Thêm khách hàng thành công")
        refetchCustomers()
        setIsDialogOpen(false)
        setEditingCustomer(null)
      },

      onError: () => toast.error("Không thể thêm khách hàng"),
    }
  )

  // Update
  const updateCustomerMutation = useMutation(
    ({ id, data }: { id: number; data: CreateCustomerRequest }) =>
      customerService.updateCustomer(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật khách hàng thành công")
        refetchCustomers()
        setIsDialogOpen(false)
        setEditingCustomer(null)
      },
      onError: () => toast.error("Không thể cập nhật khách hàng"),
    }
  )

  // Delete
  const deleteCustomerMutation = useMutation(
    (id: number) => customerService.deleteCustomer(id),
    {
      onSuccess: () => {
        toast.success("Xóa khách hàng thành công")
        refetchCustomers()
      },
      onError: () => toast.error("Không thể xóa khách hàng"),
    }
  )
  const handleValueChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN")


  const handleSave = () => {
    if (editingCustomer) {

      const updateData: UpdateCustomerProfileRequest = {
        fullName: formData.fullName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        avatar: formData.avatar,
      };
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: updateData });
    } else {
      // C
      const createData: CreateCustomerRequest = {
        fullName: formData.fullName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        password: formData.password || "",
        registerDate: formData.registerDate || new Date(),
      };
      // Validation
      if (!createData.password) {
        toast.error("Mật khẩu là bắt buộc khi tạo mới.");
        return;
      }
      createCustomerMutation.mutate(createData);
    }
  };


  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý khách hàng</h1>
          <p className="text-lg text-gray-600">Quản lý thông tin và theo dõi hoạt động khách hàng</p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null)
            setIsDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> Thêm khách hàng
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val: "all" | "active" | "inactive") => setStatusFilter(val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Khách hàng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Đơn hàng</TableHead>
              <TableHead>Tổng chi tiêu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingCustomer ? (

              <TableRow>

                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (

              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Hiện không tìm thấy khách hàng nào
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
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{formatPrice(customer.totalSpent)}</TableCell>
                  <TableCell>
                    <Badge className={customer.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {customer.active ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(customer.registerDate)}</TableCell>
                  <TableCell className="flex gap-2">
                    
                    <Button variant="outline" size="sm" onClick={() => { setViewingCustomer(customer); setIsDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditingCustomer(customer); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể được hoàn tác. Dữ liệu của khách hàng
                            <strong className="mx-1">"{customer.fullName}"</strong>
                            sẽ bị xóa vĩnh viễn khỏi máy chủ.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCustomerMutation.mutate(customer.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Tiếp tục xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/*DIALOG THÊM/SỬA*/}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setEditingCustomer(null); setIsDialogOpen(open) }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/*CÁC TRƯỜNG CHUNG CHO CẢ THÊM VÀ SỬA */}
            <div className="space-y-1">
              <label>Họ và tên *</label>
              <Input value={formData.fullName || ''} onChange={(e) => handleValueChange('fullName', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label>Email *</label>
              <Input type="email" value={formData.email || ''} onChange={(e) => handleValueChange('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label>Số điện thoại *</label>
              <Input value={formData.phone || ''} onChange={(e) => handleValueChange('phone', e.target.value)} />
            </div>

            {/*CÁC TRƯỜNG CHỈ DÀNH CHO VIỆC SỬA */}
            {editingCustomer && (
              <>
                <div className="space-y-1">
                  <label>Địa chỉ</label>
                  <Input value={formData.address || ''} onChange={(e) => handleValueChange('address', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label>Ngày sinh</label>
                  <Popover>
                    <PopoverTrigger asChild><Button variant={"outline"} className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{formData.dateOfBirth ? format(formData.dateOfBirth, "dd/MM/yyyy") : <span>Chọn ngày</span>}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dateOfBirth || undefined} onSelect={(date) => handleValueChange('dateOfBirth', date)} /></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <label>Giới tính</label>
                  <Select value={formData.gender} onValueChange={(value: Gender) => handleValueChange('gender', value)}>
                    <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Nam</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Nữ</SelectItem>
                      <SelectItem value={Gender.OTHER}>Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label>URL Ảnh đại diện</label>
                  <Input value={formData.avatar || ''} onChange={(e) => handleValueChange('avatar', e.target.value)} />
                </div>
              </>
            )}

            {/* CÁC TRƯỜNG CHỈ DÀNH CHO VIỆC THÊM MỚI */}
            {!editingCustomer && (
              <>
                <div className="space-y-1">
                  <label>Ngày đăng ký</label>
                  <Input value={formatDate(formData.registerDate?.toString() || new Date().toString())} disabled />
                </div>
                <div className="space-y-1">
                  <label>Mật khẩu *</label>
                  <Input type="password" value={formData.password || ''} onChange={(e) => handleValueChange('password', e.target.value)} />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={createCustomerMutation.isLoading || updateCustomerMutation.isLoading}>
              {editingCustomer ? 'Lưu thay đổi' : 'Tạo khách hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*DIALOG XEM CHI TIẾT KHÁCH HÀNG  */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>
              Thông tin cơ bản của khách hàng {viewingCustomer?.fullName}.
            </DialogDescription>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4 py-2">
              {/* Phần Header với Avatar, Tên, Email */}
              <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <img
                  src={viewingCustomer.avatar || `https://robohash.org/${encodeURIComponent(viewingCustomer.fullName)}`}
                  alt={viewingCustomer.fullName}
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://robohash.org/${encodeURIComponent(viewingCustomer.fullName)}`;
                  }}
                />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">{viewingCustomer.fullName}</h3>
                  <p className="text-sm text-gray-500">{viewingCustomer.email}</p>
                </div>
              </div>

              {/* Các thông tin chi tiết còn lại */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="col-span-2 font-medium">{viewingCustomer.phone}</p>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="col-span-2 font-medium">{viewingCustomer.address}</p>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <p className="text-sm text-gray-500">Ngày tham gia</p>
                <p className="col-span-2 font-medium">{formatDate(viewingCustomer.registerDate)}</p>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div className="col-span-2">
                  <Badge variant={viewingCustomer.active ? "default" : "secondary"}>
                    {viewingCustomer.active ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              </div>
              {viewingCustomer.dateOfBirth && (
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="col-span-2 font-medium">{formatDate(viewingCustomer.dateOfBirth)}</p>
                </div>
              )}
              {viewingCustomer.gender && (
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="col-span-2 font-medium">{viewingCustomer.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
