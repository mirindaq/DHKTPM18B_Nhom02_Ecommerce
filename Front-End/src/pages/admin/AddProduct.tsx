import { ProductPageWrapper } from "@/components/admin/products";

export default function AddProduct() {
  return (
    <ProductPageWrapper
      mode="add"
      title="Thêm sản phẩm"
      description="Điền thông tin để tạo sản phẩm mới trong hệ thống"
      successMessage="Thêm sản phẩm thành công"
      errorMessage="Không thể thêm sản phẩm"
      submitButtonText="Thêm sản phẩm"
    />
  );
}
