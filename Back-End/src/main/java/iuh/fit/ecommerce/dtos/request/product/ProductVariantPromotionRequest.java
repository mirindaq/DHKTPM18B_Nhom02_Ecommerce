package iuh.fit.ecommerce.dtos.request.product;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductVariantPromotionRequest {
    @NotNull(message = "Product variant IDs cannot be null")
    private List<Long> productVariantIds;
}
