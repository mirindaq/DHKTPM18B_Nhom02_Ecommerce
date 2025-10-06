package iuh.fit.ecommerce.dtos.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private Integer stock;
    private Double discount;
    private String description;
    private String thumbnail;
    private boolean status;
    private Double rating;
    private String spu;
    private Long brandId;
    private Long categoryId;
    private List<String> productImages;
    private List<ProductAttributeResponse> attributes;
    private List<ProductVariantResponse> variants;
}
