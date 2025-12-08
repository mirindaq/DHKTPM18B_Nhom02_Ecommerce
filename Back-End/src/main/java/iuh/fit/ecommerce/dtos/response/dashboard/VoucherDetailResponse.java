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
public class VoucherDetailResponse {
    private Long voucherId;
    private String voucherCode;
    private String voucherName;
    private Long totalUsage;
    private Double totalDiscountAmount;
    private List<VoucherOrderDetailResponse> orders;
}
