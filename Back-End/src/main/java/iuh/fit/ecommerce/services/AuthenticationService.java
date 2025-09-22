package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.authentication.LoginRequest;
import iuh.fit.ecommerce.dtos.request.authentication.RefreshTokenRequest;
import iuh.fit.ecommerce.dtos.response.authentication.LoginResponse;
import iuh.fit.ecommerce.dtos.response.authentication.RefreshTokenResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthenticationService {
    LoginResponse staffLogin(LoginRequest loginRequest);

    RefreshTokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest);

    void logout(HttpServletRequest request);

}
