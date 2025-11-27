package iuh.fit.ecommerce.dtos.response.supplier;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SupplierResponse {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private Boolean status;
}
