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
public class ProductDetailResponse {
    private Long productId;
    private String productName;
    private String productImage;
    private Long totalQuantitySold;
    private Double totalRevenue;
    private List<ProductOrderDetailResponse> orders;
}
