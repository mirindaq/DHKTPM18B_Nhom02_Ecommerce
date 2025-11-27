package iuh.fit.ecommerce.dtos.request.supplier;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String address;

    private Boolean status = true;
}
