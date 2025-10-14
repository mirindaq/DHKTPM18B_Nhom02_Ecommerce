package iuh.fit.ecommerce.dtos.request.voucher;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherCustomerRequest {
    @NotNull(message = "Customer ID must not be null")
    private Long customerId;
}