package iuh.fit.ecommerce.dtos.response.purchaseOrder;

import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PurchaseOrderResponse {
    private Long id;
    private String purchaseDate;
    private Double totalPrice;
    private String note;
    private SupplierResponse supplier;
    private StaffResponse staff;
    private List<PurchaseOrderDetailResponse> details;
}
