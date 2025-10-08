package iuh.fit.ecommerce.dtos.request.authentication;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutRequest {
    private String accessToken;
}