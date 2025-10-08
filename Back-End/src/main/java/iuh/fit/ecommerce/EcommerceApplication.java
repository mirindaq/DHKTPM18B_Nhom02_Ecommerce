package iuh.fit.ecommerce;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.TimeZone;

@SpringBootApplication
@EnableConfigurationProperties(OAuth2ClientProperties.class)
public class EcommerceApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		Path dotenvPath = Paths.get("local.env");
		if (Files.exists(dotenvPath)) {
			Dotenv dotenv = Dotenv.configure()
					.filename("local.env")
					.load();

			dotenv.entries().forEach(entry ->
					System.setProperty(entry.getKey(), entry.getValue())
			);
		}


		SpringApplication.run(EcommerceApplication.class, args);
	}

}
