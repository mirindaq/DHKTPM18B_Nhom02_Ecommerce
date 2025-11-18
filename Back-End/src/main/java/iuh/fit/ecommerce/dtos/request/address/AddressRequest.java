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


    private Integer wardId;

    private String fullName;

    @Pattern(regexp = "^(0|\\+84)(\\d{9,10})$",
            message = "Phone number must be valid Vietnamese format")
    private String phone;

    private Boolean isDefault;
}

