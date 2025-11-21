package iuh.fit.ecommerce.dtos.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryMessage {
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
}

