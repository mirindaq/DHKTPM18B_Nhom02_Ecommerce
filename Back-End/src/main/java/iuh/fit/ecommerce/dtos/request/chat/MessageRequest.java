package iuh.fit.ecommerce.dtos.request.chat;

import iuh.fit.ecommerce.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {
    
    @NotNull(message = "Chat ID is required")
    private Long chatId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Message type is required")
    private MessageType messageType;
    
    @NotNull(message = "Sender ID is required")
    private Long senderId;
    
    private Boolean isStaff; // true nếu người gửi là nhân viên, false nếu là khách hàng
}

