package iuh.fit.ecommerce.dtos.response.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAIResponse {
    private String message;
    private String role; // "assistant" hoặc "system"
}

