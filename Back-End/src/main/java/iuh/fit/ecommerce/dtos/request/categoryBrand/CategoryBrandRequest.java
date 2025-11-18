package iuh.fit.ecommerce.dtos.request.categoryBrand;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO này được sử dụng cho mọi yêu cầu liên quan đến
 * việc quản lý liên kết giữa Category và Brand.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBrandRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Brand ID is required")
    private Long brandId;
}