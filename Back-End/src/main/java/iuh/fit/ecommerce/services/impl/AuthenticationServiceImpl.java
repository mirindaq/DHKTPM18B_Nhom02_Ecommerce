package iuh.fit.ecommerce.services.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.jsonwebtoken.JwtException;
import iuh.fit.ecommerce.configurations.jwt.JwtUtil;
import iuh.fit.ecommerce.dtos.request.authentication.LoginRequest;
import iuh.fit.ecommerce.dtos.request.authentication.RefreshTokenRequest;
import iuh.fit.ecommerce.dtos.response.authentication.LoginResponse;
import iuh.fit.ecommerce.dtos.response.authentication.RefreshTokenResponse;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.enums.TokenType;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.exceptions.custom.UnauthorizedException;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.repositories.UserRepository;
import iuh.fit.ecommerce.services.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    @Value("${spring.security.oauth2.client.provider.google.authorization-uri}")
    private String authorizationUri;

    @Value("${spring.security.oauth2.client.provider.google.token-uri}")
    private String tokenUri;

    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String userInfoUri;

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OAuth2ClientProperties oAuth2ClientProperties;

    @Override
    public LoginResponse staffLogin(LoginRequest loginRequest) {

        Staff staff = staffRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with email: " + loginRequest.getEmail()));

        if (!passwordEncoder.matches(loginRequest.getPassword(), staff.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        if (!staff.getActive()) {
            throw new DisabledException("User is disabled");
        }

        String token = jwtUtil.generateAccessToken(staff);
        String refreshToken = jwtUtil.generateRefreshToken(staff);

        staff.setRefreshToken(refreshToken);
        staffRepository.save(staff);

        List<String> roles = staff.getUserRoles()
                .stream().map(userRole -> userRole.getRole().getName().toUpperCase())
                .toList();

        return LoginResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .roles(roles)
                .email(staff.getEmail())
                .build();
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
            if (!jwtUtil.validateJwtToken(refreshToken, TokenType.REFRESH_TOKEN)) {
                throw new JwtException("Invalid or expired refresh token");
            }
            String email = jwtUtil.getUserNameFromJwtToken(refreshToken, TokenType.REFRESH_TOKEN);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + email));

            if (!refreshToken.equals(user.getRefreshToken())) {
                throw new BadCredentialsException("Invalid refresh token");
            }

        if (!user.getActive()) {
            throw new UnauthorizedException("User is disabled");
        }

            String accessToken = jwtUtil.generateAccessToken(user);
            return RefreshTokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .email(email)
                    .build();

    }

    @Override
    public void logout(HttpServletRequest request) {

    }

    @Override
    public String generateAuthUrl(String loginType) {
        if ("google".equalsIgnoreCase(loginType)) {
            OAuth2ClientProperties.Registration registration = oAuth2ClientProperties.getRegistration().get(loginType);
            OAuth2ClientProperties.Provider provider = oAuth2ClientProperties.getProvider().get(loginType);

            String scope = "openid profile email";
            String responseType = "code";

            return UriComponentsBuilder.fromHttpUrl(provider.getAuthorizationUri())
                    .queryParam("client_id", registration.getClientId())
                    .queryParam("redirect_uri", registration.getRedirectUri())
                    .queryParam("response_type", responseType)
                    .queryParam("scope", scope)
                    .build()
                    .toUriString();
        }
        throw new IllegalArgumentException("Unsupported login type: " + loginType);
    }

    @Override
    public LoginResponse socialLoginCallback(String loginType, String code) throws IOException {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
        String accessToken;
        if ("google".equalsIgnoreCase(loginType)) {
            accessToken = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    new JacksonFactory(),
                    clientId,
                    clientSecret,
                    code,
                    redirectUri).execute().getAccessToken();

        } else {
            throw new IllegalArgumentException("Unsupported login type: " + loginType);
        }

        restTemplate.getInterceptors()
                .add((request, body, execution) -> {
                    request.getHeaders().set("Authorization", "Bearer " + accessToken);
                    return execution.execute(request, body);
                });

        Map<String,Object> userInfo = new ObjectMapper().readValue(
                restTemplate.getForEntity(userInfoUri, String.class).getBody(),
                new TypeReference<>() {
                }
        );

//        User user = userRepository.findByEmail(userInfo.get("email").toString())
//                .orElseGet(() -> {
//                    User newUser = new User();
//                    newUser.setEmail(userInfo.get("email").toString());
//                    newUser.setFullName(userInfo.get("name").toString());
//                    newUser.setActive(true);
//                    newUser.setRole(roleRepository.findByName("CUSTOMER"));
//                    return userRepository.save(newUser);
//                });
//
//        if (!user.isActive()) {
//            throw new ConflictException("User is not enabled");
//        }
//
//        String accessTokenUser = jwtUtil.generateAccessToken(user);
//        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
//
//        return LoginResponse.builder()
//                .accessToken(accessTokenUser)
//                .refreshToken(refreshToken.getRefreshToken())
//                .role(Collections.singletonList(user.getRole().getName()))
//                .build();

        return null;
    }
}
