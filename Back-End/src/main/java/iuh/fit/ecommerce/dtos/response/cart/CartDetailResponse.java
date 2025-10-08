package iuh.fit.ecommerce.dtos.response.cart;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailResponse {
    private Long productVariantId;
    private String productName;
    private String productImage;
    private String sku;
    private int quantity;
    private double discount;
    private double price;
}
