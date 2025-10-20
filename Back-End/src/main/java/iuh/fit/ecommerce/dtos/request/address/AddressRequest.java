package iuh.fit.ecommerce.dtos.request.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddressRequest {
    @NotBlank(message = "Sub address is required")
    private String subAddress;

    private Boolean isDefault;
    private String wardCode;
}

