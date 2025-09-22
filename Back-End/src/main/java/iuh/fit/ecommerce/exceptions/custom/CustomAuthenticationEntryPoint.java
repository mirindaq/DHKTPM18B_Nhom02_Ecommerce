package iuh.fit.ecommerce.exceptions.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.ecommerce.dtos.response.base.ResponseError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        ResponseError error = ResponseError.builder()
                .timestamp(new Date())
                .status(HttpServletResponse.SC_UNAUTHORIZED)
                .error("Unauthorized")
                .path(request.getRequestURI())
                .message("Missing or invalid token")
                .build();

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String jsonError = new ObjectMapper().writeValueAsString(error);
        response.getWriter().write(jsonError);
    }
}
