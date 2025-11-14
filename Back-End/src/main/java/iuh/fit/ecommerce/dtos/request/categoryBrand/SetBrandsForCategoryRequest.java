package iuh.fit.ecommerce.dtos.request.categoryBrand;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SetBrandsForCategoryRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "List brand ID cannot be null")
    @Size(min = 0, message = "List brand ID must have at least 1 value")
    private List<Long> brandIds;

}