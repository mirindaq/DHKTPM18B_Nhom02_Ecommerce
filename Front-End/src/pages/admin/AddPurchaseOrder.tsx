import { PurchaseOrderPageWrapper } from "@/components/admin/purchase-order";

export default function AddPurchaseOrder() {
  return (
    <PurchaseOrderPageWrapper
      title="Tạo phiếu nhập hàng mới"
      description="Chọn nhà cung cấp và sản phẩm cần nhập vào kho"
      successMessage="Tạo phiếu nhập hàng thành công"
      errorMessage="Không thể tạo phiếu nhập hàng"
      submitButtonText="Tạo phiếu nhập"
    />
  );
}
