package iuh.fit.ecommerce.dtos.request.variantCategory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SetVariantsForCategoryRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "List variant ID cannot be null")
    @Size(min = 0, message = "List variant ID must have at least 0 value")
    private List<Long> variantIds;
}

