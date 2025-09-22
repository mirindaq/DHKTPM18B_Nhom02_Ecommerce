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

    @NotNull(message = "CategoryId is not null null")
    private Long categoryId;

    private List<VariantValueAddRequest> variantValues;
}