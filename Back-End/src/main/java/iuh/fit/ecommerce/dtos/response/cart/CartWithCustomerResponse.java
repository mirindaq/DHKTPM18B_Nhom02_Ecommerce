package iuh.fit.ecommerce.dtos.response.cart;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartWithCustomerResponse {

    private Long cartId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAvatar;
    private Long totalItems;
    private List<CartDetailResponse> items;
    private double totalPrice;
    private LocalDateTime modifiedAt;
    private LocalDateTime lastReminderSentAt;
}
