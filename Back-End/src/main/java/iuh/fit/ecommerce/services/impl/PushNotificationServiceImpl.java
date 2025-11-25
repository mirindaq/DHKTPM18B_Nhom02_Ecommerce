package iuh.fit.ecommerce.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.ecommerce.services.PushNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PushNotificationServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    @Override
    @Async
    public void sendPushNotification(String expoPushToken, String title, String body, Object data) {
        if (expoPushToken == null || expoPushToken.isEmpty()) {
            log.warn("Expo push token is null or empty, skipping notification");
            return;
        }

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("to", expoPushToken);
            message.put("sound", "default");
            message.put("title", title);
            message.put("body", body);
            message.put("data", data);
            message.put("priority", "high");
            message.put("channelId", "default");

            String jsonBody = objectMapper.writeValueAsString(message);

            // Thiết lập header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            // Gửi yêu cầu POST tới Expo Push API
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    EXPO_PUSH_URL,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Push notification sent successfully to token: {}", expoPushToken);
            } else {
                log.error("Failed to send push notification. Status: {}, Response: {}",
                        response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Error sending push notification to token: {}", expoPushToken, e);
        }
    }
}
