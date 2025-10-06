package iuh.fit.ecommerce.dtos.request.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartAddRequest {

    @NotNull
    private Long productVariantId;

    @Min(1)
    private int quantity;
}