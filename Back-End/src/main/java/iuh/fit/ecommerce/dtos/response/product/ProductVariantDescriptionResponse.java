package iuh.fit.ecommerce.dtos.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductVariantDescriptionResponse {
    private Long id;
    private String name;
    private Double price;
    private String thumbnail;
    private String sku;
    private Integer stock;
    private String brandName;
    private String categoryName;
}