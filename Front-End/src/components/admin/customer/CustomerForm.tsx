import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { CustomerSummary, CreateCustomerRequest, UpdateCustomerProfileRequest } from "@/types/customer.type"

interface CustomerFormProps {
    customer?: CustomerSummary | null
    onSubmit: (data: CreateCustomerRequest) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function CustomerForm({ customer, onSubmit, onCancel, isLoading }: CustomerFormProps) {


    const [formData, setFormData] = useState<Partial<CreateCustomerRequest & UpdateCustomerProfileRequest>>({})

    useEffect(() => {
        if (customer) {

            setFormData({
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,

            });
        } else {

            setFormData({
                fullName: "",
                email: "",
                phone: "",
                password: "",
                registerDate: new Date(), // SỬA 3: Sửa "" thành new Date()
            });
        }
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium text-gray-700">
                    Tên khách hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="col-span-3"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right font-medium text-gray-700">
                    Số điện thoại
                </Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="col-span-3"
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right font-medium text-gray-700">
                    Địa chỉ
                </Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="col-span-3"
                    disabled={isLoading}
                />
            </div>



            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        customer ? "Cập nhật" : "Thêm"
                    )}
                </Button>
            </div>
        </form>
    )
}
