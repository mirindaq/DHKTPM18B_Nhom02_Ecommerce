package iuh.fit.ecommerce.dtos.response.supplier;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupplierResponse {
    private String id;
    private String name;
    private String phone;
    private String address;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}