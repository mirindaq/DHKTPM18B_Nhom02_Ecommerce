package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopVoucherResponse {
    private Long voucherId;
    private String voucherCode;
    private String voucherName;
    private Long usageCount;
    private Double totalDiscountAmount;
}
