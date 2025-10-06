package iuh.fit.ecommerce.dtos.response.cart;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
}
