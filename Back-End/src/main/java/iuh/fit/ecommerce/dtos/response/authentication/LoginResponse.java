package iuh.fit.ecommerce.dtos.response.authentication;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private List<String> roles;
}
