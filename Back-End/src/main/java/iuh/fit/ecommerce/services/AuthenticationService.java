package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.authentication.LoginRequest;
import iuh.fit.ecommerce.dtos.request.authentication.RegisterRequest;
import iuh.fit.ecommerce.dtos.response.authentication.LoginResponse;
import iuh.fit.ecommerce.dtos.response.authentication.RefreshTokenResponse;
import iuh.fit.ecommerce.dtos.response.user.UserProfileResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.io.IOException;

public interface AuthenticationService {
    LoginResponse staffLogin(LoginRequest loginRequest);

    RefreshTokenResponse refreshToken(HttpServletRequest request);

    void logout(HttpServletRequest request);

    String generateAuthUrl(String loginType, String redirectUri);

    LoginResponse socialLoginCallback(String loginType, String code, String redirectUri) throws IOException;

    LoginResponse userLogin(LoginRequest loginRequest);

    UserProfileResponse getProfile();

    void register(@Valid RegisterRequest registerRequest);
}
