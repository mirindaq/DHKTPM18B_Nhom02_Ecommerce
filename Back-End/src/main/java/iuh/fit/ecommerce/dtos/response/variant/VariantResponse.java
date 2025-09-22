package iuh.fit.ecommerce.dtos.response.variant;

import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private Long id;
    private String name;
    private boolean status;
    private CategoryResponse category;
    private List<VariantValueResponse> variantValues;
}
