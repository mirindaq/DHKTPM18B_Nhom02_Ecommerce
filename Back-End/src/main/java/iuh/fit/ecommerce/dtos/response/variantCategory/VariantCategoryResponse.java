package iuh.fit.ecommerce.dtos.response.variantCategory;

import lombok.*;

/**
 * DTO này trả về thông tin chi tiết của liên kết
 * giữa Variant và Category sau khi được tạo thành công.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantCategoryResponse {
    private Long id;

    private Long variantId;
    private String variantName;

    private Long categoryId;
    private String categoryName;
}

