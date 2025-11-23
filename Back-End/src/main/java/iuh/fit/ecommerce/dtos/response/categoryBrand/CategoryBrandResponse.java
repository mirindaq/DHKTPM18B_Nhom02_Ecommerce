package iuh.fit.ecommerce.dtos.response.categoryBrand;

import lombok.*;

/**
 * DTO này trả về thông tin chi tiết của liên kết
 * giữa Category và Brand sau khi được tạo thành công.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBrandResponse {

    // ID của chính liên kết (CategoryBrand)
    private Long id;

    // Thông tin của Category
    private Long categoryId;
    private String categoryName;

    // Thông tin của Brand
    private Long brandId;
    private String brandName;
}