package iuh.fit.ecommerce.dtos.response.wishList;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishListResponse {
    private Long productVariantId;
    private String productName;
    private String productImage;
    private Double price;
    private String sku;
}
