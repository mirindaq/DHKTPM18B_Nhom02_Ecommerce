import { ProductPageWrapper } from "@/components/admin/products";

export default function EditProduct() {
  return (
    <ProductPageWrapper
      mode="edit"
      title="Chỉnh sửa sản phẩm"
      description="Cập nhật thông tin sản phẩm"
      successMessage="Cập nhật sản phẩm thành công"
      errorMessage="Không thể cập nhật sản phẩm"
      submitButtonText="Cập nhật sản phẩm"
    />
  );
}
