package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherPromotionComparisonResponse {
    // Period labels
    private String period1Label;
    private String period2Label;
    
    // Voucher statistics
    private Long voucherUsageCount1;
    private Long voucherUsageCount2;
    private Double voucherTotalDiscount1;
    private Double voucherTotalDiscount2;
    private Long voucherUsageDifference;
    private Double voucherUsageGrowthPercent;
    private Double voucherDiscountDifference;
    private Double voucherDiscountGrowthPercent;
    
    // Promotion statistics
    private Long promotionUsageCount1;
    private Long promotionUsageCount2;
    private Double promotionTotalDiscount1;
    private Double promotionTotalDiscount2;
    private Long promotionUsageDifference;
    private Double promotionUsageGrowthPercent;
    private Double promotionDiscountDifference;
    private Double promotionDiscountGrowthPercent;
    
    // Combined statistics
    private Double totalDiscount1;
    private Double totalDiscount2;
    private Double totalDiscountDifference;
    private Double totalDiscountGrowthPercent;
}
