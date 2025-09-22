package iuh.fit.ecommerce.dtos.response.product;

import iuh.fit.ecommerce.dtos.response.variant.VariantValueResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductVariantValueResponse {
    private Long id;
    private VariantValueResponse variantValue;
}
