package iuh.fit.ecommerce.configurations;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("Ecommerce API")
                .description("API documentation for the E-commerce application")
                .version("1.0.0")
                .termsOfService("https://www.example.com/terms")
                .contact(new io.swagger.v3.oas.models.info.Contact()
                        .name("Support Team")
                        .email("gvhoang30112004@gmail.com")));

    }
}
