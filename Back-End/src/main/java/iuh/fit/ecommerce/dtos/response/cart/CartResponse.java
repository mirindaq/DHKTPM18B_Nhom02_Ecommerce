package iuh.fit.ecommerce.dtos.response.cart;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long cartId;
    private Long userId;
    private List<CartDetailResponse> items;
    private double totalPrice;
}
