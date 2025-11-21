package iuh.fit.ecommerce.dtos.response.chat;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long staffId;
    private String staffName;
    private String staffEmail;
    private Long unreadCount;
    private MessageResponse lastMessage;
    private List<MessageResponse> messages;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedAt;
}

