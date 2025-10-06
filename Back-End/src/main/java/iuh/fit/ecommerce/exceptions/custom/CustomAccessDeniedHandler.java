package iuh.fit.ecommerce.exceptions.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.ecommerce.dtos.response.base.ResponseError;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ResponseError error = ResponseError.builder()
                .timestamp(new Date())
                .status(HttpServletResponse.SC_FORBIDDEN)
                .error("Forbidden")
                .path(request.getRequestURI())
                .message("Access denied. You don't have the required role.")
                .build();

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        new ObjectMapper().writeValue(response.getWriter(), error);
    }
}