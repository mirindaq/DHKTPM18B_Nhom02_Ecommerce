package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopPromotionResponse {
    private Long promotionId;
    private String promotionName;
    private String promotionType;
    private Long usageCount;
    private Double totalDiscountAmount;
}
