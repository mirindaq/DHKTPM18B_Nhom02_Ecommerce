package iuh.fit.ecommerce.dtos.response.cart;

import iuh.fit.ecommerce.entities.BaseEntity;
import lombok.*;

import java.time.LocalDateTime;
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
    private LocalDateTime modifiedAt;
}
