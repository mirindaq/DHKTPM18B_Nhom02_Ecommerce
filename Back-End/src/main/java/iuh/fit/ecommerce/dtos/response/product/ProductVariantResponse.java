package iuh.fit.ecommerce.dtos.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ProductVariantResponse {
    private Long id;
    private Double price;
    private Double oldPrice;
    private String sku;
    private Integer stock;
    private List<ProductVariantValueResponse> productVariantValues;
}
