package iuh.fit.ecommerce.dtos.request.order;

import iuh.fit.ecommerce.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreationRequest {

    private String receiverAddress;

    private String receiverName;

    private String receiverPhone;

    private String note;

    private boolean subscribeEmail;

    private String email;

    @NotNull( message = "isPickup is required" )
    private Boolean isPickup;

    private Long voucherId;

    private PaymentMethod paymentMethod;

    @NotNull( message = "cartItemIds is required" )
    private List<Long> cartItemIds;

    private String platform; // "web" or "mobile"
}
