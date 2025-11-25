package iuh.fit.ecommerce.dtos.request.customer;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePushTokenRequest {

    @NotBlank(message = "Expo push token is required")
    private String expoPushToken;
}

