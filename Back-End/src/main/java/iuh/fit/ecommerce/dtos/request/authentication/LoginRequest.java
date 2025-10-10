package iuh.fit.ecommerce.dtos.request.authentication;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginRequest {
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Password không được để trống")
    private String password;

    private String deviceInfo;
}