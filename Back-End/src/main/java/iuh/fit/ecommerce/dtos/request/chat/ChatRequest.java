package iuh.fit.ecommerce.dtos.request.chat;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    private Long staffId; // Có thể null khi khách hàng tạo chat mới
}

