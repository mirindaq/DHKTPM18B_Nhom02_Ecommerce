package iuh.fit.ecommerce.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
public class PayOsConfig {
    @Value("${payment.pay_os.client-id}")
    private String clientId;
    @Value("${payment.pay_os.api-key}")
    private String apiKey;
    @Value("${payment.pay_os.checksum-key}")
    private String checksumKey;

    @Bean
    public PayOS payOS() {
        return new PayOS(clientId, apiKey, checksumKey);
    }
}
