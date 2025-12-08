package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDetailResponse {
    private Long promotionId;
    private String promotionName;
    private String promotionType;
    private Long totalUsage;
    private Double totalDiscountAmount;
    private List<PromotionOrderDetailResponse> orders;
}
