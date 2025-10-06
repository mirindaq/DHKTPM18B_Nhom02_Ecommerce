package iuh.fit.ecommerce.configurations.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import iuh.fit.ecommerce.constraints.Endpoints;
import iuh.fit.ecommerce.dtos.response.base.ResponseError;
import iuh.fit.ecommerce.enums.TokenType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

@RequiredArgsConstructor
@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtil.validateJwtToken(jwt, TokenType.ACCESS_TOKEN)) {
                String username = jwtUtil.getUserNameFromJwtToken(jwt, TokenType.ACCESS_TOKEN);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (ExpiredJwtException e){
            sendErrorResponse(response,request, "Token expired");
            return;
        }
        catch (DisabledException e){
            sendErrorResponse(response,request,"User account is disabled");
            return;
        }
        catch (Exception e){
            sendErrorResponse(response,request, "Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }

    private boolean isPublicEndpoint(String requestURI) {
        return Arrays.stream(Endpoints.PRIVATE_ENDPOINT)
                .noneMatch(requestURI::matches);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpServletRequest request, String message) throws IOException {

        ResponseError error = ResponseError.builder()
                .timestamp(new Date())
                .status(HttpServletResponse.SC_UNAUTHORIZED)
                .error("Unauthorized")
                .path(request.getRequestURI())
                .message(message)
                .build();

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String jsonError = new ObjectMapper().writeValueAsString(error);
        response.getWriter().write(jsonError);
    }

}
