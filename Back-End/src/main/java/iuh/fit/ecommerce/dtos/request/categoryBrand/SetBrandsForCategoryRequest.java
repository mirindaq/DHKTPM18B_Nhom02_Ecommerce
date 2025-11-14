package iuh.fit.ecommerce.dtos.request.categoryBrand;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SetBrandsForCategoryRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    // Gửi một danh sách các ID thương hiệu
    private List<Long> brandIds;

    // Getters and Setters
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public List<Long> getBrandIds() {
        return brandIds;
    }

    public void setBrandIds(List<Long> brandIds) {
        this.brandIds = brandIds;
    }
}