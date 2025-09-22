package iuh.fit.ecommerce.services.impl;

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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
}
