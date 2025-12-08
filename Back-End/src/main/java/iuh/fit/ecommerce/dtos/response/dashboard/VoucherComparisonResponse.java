package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherComparisonResponse {
    private String period1Label;
    private String period2Label;
    
    private Long usageCount1;
    private Long usageCount2;
    private Double totalDiscount1;
    private Double totalDiscount2;
    
    private Long usageDifference;
    private Double usageGrowthPercent;
    private Double discountDifference;
    private Double discountGrowthPercent;
}
