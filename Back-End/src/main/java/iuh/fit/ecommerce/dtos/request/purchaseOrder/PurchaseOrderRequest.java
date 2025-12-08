package iuh.fit.ecommerce.dtos.request.purchaseOrder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PurchaseOrderRequest {

    @NotBlank(message = "Supplier ID is required")
    private Long supplierId;

    private String note;

    @NotEmpty(message = "Purchase order details cannot be empty")
    @Valid
    private List<PurchaseOrderDetailRequest> details;
}
