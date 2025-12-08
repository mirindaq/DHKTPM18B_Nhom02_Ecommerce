package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponse {
    private String period1Label;
    private String period2Label;
    private Double revenue1;
    private Double revenue2;
    private Long orderCount1;
    private Long orderCount2;
    private Double revenueDifference;
    private Double revenueGrowthPercent;
    private Long orderDifference;
    private Double orderGrowthPercent;
}
