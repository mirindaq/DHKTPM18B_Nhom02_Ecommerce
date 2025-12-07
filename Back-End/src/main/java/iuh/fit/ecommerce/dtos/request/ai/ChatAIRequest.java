package iuh.fit.ecommerce.dtos.request.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatAIRequest {
    @NotBlank(message = "Message is required")
    private String message;
    
    // Optional - null nếu user chưa đăng nhập
    private Long customerId;
    
    // Session ID để track conversation
    @NotBlank(message = "Session ID is required")
    private String sessionId;
}

