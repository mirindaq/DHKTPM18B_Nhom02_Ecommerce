package iuh.fit.ecommerce.dtos.request.wishList;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishListRequest {

    @NotNull
    private Long productId;

}
