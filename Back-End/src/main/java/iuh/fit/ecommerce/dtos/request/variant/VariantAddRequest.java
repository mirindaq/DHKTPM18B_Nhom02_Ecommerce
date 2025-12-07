package iuh.fit.ecommerce.dtos.request.variant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class VariantAddRequest {
    @NotBlank(message = "Variant name is required")
    private String name;

    private Boolean status;

    private List<VariantValueAddRequest> variantValues;
}