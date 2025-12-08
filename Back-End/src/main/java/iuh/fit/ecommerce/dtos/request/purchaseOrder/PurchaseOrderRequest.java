package iuh.fit.ecommerce.dtos.request.purchaseOrder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String note;

    @NotEmpty(message = "Purchase order details cannot be empty")
    @Valid
    private List<PurchaseOrderDetailRequest> details;
}
