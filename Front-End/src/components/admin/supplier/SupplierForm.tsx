import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Supplier, SupplierRequest } from "@/types/supplier.type"
import { useEffect } from "react"

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Tên nhà cung cấp phải có ít nhất 3 ký tự" }),
  phone: z
    .string()
    .regex(
      /^(0[3|5|7|8|9])([0-9]{8})$/,
      "Số điện thoại không hợp lệ (10 số, bắt đầu 03,05,07,08,09)",
    ),
  address: z.string().optional(),
})

interface SupplierFormProps {
  supplier: Supplier | null
  onSubmit: (data: SupplierRequest) => Promise<void>
  onCancel: () => void
  onFinished: () => void
  isLoading: boolean
}

// Lưu ý: Có "export default" để tránh lỗi import
export default function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
  isLoading,
}: SupplierFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        phone: supplier.phone,
        address: supplier.address || "",
      })
    } else {
      form.reset({ name: "", phone: "", address: "" })
    }
  }, [supplier, form])

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values as SupplierRequest)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhà cung cấp</FormLabel>
              <FormControl>
                <Input placeholder="VD: Nhà cung cấp A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="0987654321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ (Không bắt buộc)</FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: 123 Đường ABC, Q1, TPHCM"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  )
}